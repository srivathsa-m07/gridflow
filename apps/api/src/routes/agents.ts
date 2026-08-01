import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Agent } from '../models/Agent';
import { ProvisioningToken } from '../models/ProvisioningToken';
import { generateAgentSecret, hashSecret, formatAgentToken } from '../utils/secrets';
import { issueProvisioningToken, invalidatePendingProvisioningTokens } from '../services/provisioning';
import { env } from '../config/env';

const router = Router();

const toAgentSummary = (agent: {
  _id: unknown;
  name: string;
  hostname?: string;
  backendUrl?: string;
  createdAt: Date;
  status: string;
  lastHeartbeatAt?: Date;
  revokedAt?: Date;
  secretRotatedAt?: Date;
}) => ({
  id: agent._id,
  name: agent.name,
  hostname: agent.hostname,
  backendUrl: agent.backendUrl,
  createdAt: agent.createdAt,
  status: agent.status,
  registered: agent.secretRotatedAt !== undefined,
  lastHeartbeatAt: agent.lastHeartbeatAt,
  revokedAt: agent.revokedAt,
  secretRotatedAt: agent.secretRotatedAt
});

// Published, multi-arch image built by .github/workflows/agent-release.yml —
// no repository clone or local `docker build` required.
const AGENT_IMAGE_TAG = `${env.AGENT_IMAGE}:latest`;

const buildInstallCommands = (agentName: string, backendUrl: string, provisioningToken: string) => {
  const slugName = agentName.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'gridflow-agent';
  return {
    dockerPull: `docker pull ${AGENT_IMAGE_TAG}`,
    dockerRun: `docker run -d \\\n  --name ${slugName} \\\n  --restart=unless-stopped \\\n  -e BACKEND_URL="${backendUrl}" \\\n  -e PROVISIONING_TOKEN="${provisioningToken}" \\\n  ${AGENT_IMAGE_TAG}`,
    dockerRunSimple: `docker run -e BACKEND_URL="${backendUrl}" -e PROVISIONING_TOKEN="${provisioningToken}" ${AGENT_IMAGE_TAG}`,
    local: `PROVISIONING_TOKEN="${provisioningToken}" BACKEND_URL="${backendUrl}" npm run dev:agent`
  };
};

// List agents for organization
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agents = await Agent.find({ organizationId: orgId });
    res.json(agents.map(toAgentSummary));
  } catch (err) {
    next(err);
  }
});

// Agent detail — includes pending-provisioning status when the agent has
// never completed registration, so onboarding state isn't lost once the
// original create-agent API response scrolls out of view.
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agent = await Agent.findOne({ _id: req.params.id, organizationId: orgId });

    if (!agent) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
    }

    let pendingProvisioning: { expiresAt: Date; used: boolean } | null = null;
    if (!agent.secretRotatedAt) {
      const latestToken = await ProvisioningToken.findOne({ agentId: agent._id }).sort({ createdAt: -1 });
      if (latestToken) {
        pendingProvisioning = { expiresAt: latestToken.expiresAt, used: !!latestToken.usedAt };
      }
    }

    res.json({ agent: toAgentSummary(agent), pendingProvisioning });
  } catch (err) {
    next(err);
  }
});

// Create agent for organization. Two-phase provisioning: this only creates
// the Agent record (status "created", no permanent credential yet) and a
// short-lived, single-use provisioning token. The agent exchanges that token
// for its real credential via POST /api/agent/register on first startup —
// the permanent secret itself is never generated here and never appears in
// the install command below.
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const { name, hostname, backendUrl } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: { message: 'Agent name is required' } });
    }
    if (backendUrl !== undefined && typeof backendUrl !== 'string') {
      return res.status(400).json({ error: { message: 'Invalid backendUrl' } });
    }

    const agent = await Agent.create({
      name: name.trim(),
      organizationId: orgId,
      hostname: hostname || undefined,
      backendUrl: backendUrl || undefined,
      status: 'created'
    });

    const { token, expiresAt } = await issueProvisioningToken(agent._id, agent.organizationId);

    res.status(201).json({
      agent: toAgentSummary(agent),
      // Field kept as `agentKey` for compatibility with the existing
      // onboarding UI, which only displays whatever value it's given — the
      // value itself is now a short-lived provisioning token, never a
      // permanent credential.
      agentKey: token,
      provisioningTokenExpiresAt: expiresAt,
      commands: backendUrl ? buildInstallCommands(agent.name, backendUrl, token) : undefined
    });
  } catch (err) {
    next(err);
  }
});

// Retrieve (or re-issue, if the previous one expired/was used/was never
// completed) the installation command for an agent. Always mints a fresh
// provisioning token — this is also how a re-install / reprovisioning flow
// works, since a token is single-use by design.
router.get('/:id/install-command', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agent = await Agent.findOne({ _id: req.params.id, organizationId: orgId });

    if (!agent) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
    }

    if (agent.status === 'revoked') {
      return res.status(409).json({ error: { message: 'Cannot issue an install command for a revoked agent' } });
    }

    const backendUrl = (req.query.backendUrl as string | undefined) || agent.backendUrl;
    if (!backendUrl) {
      return res.status(400).json({ error: { message: 'backendUrl is required (pass ?backendUrl= or set it when creating the agent)' } });
    }

    const { token, expiresAt } = await issueProvisioningToken(agent._id, agent.organizationId);

    res.json({
      agent: toAgentSummary(agent),
      agentKey: token,
      provisioningTokenExpiresAt: expiresAt,
      commands: buildInstallCommands(agent.name, backendUrl, token)
    });
  } catch (err) {
    next(err);
  }
});

// Rotate an agent's permanent secret. Only meaningful once an agent has
// completed registration — a not-yet-registered agent has no permanent
// credential to rotate, only a provisioning token (see /install-command).
router.post('/:id/rotate-key', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const rawSecret = generateAgentSecret();
    const secretHash = await hashSecret(rawSecret);

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId, status: { $ne: 'revoked' }, secretHash: { $exists: true } },
      { $set: { secretHash, secretRotatedAt: new Date() } },
      { new: true }
    );

    if (!agent) {
      const existing = await Agent.findOne({ _id: req.params.id, organizationId: orgId });
      if (!existing) {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      if (existing.status === 'revoked') {
        return res.status(409).json({ error: { message: 'Cannot rotate the key of a revoked agent' } });
      }
      return res.status(409).json({ error: { message: 'Agent has not completed registration yet — use the install command instead' } });
    }

    res.json({
      agent: toAgentSummary(agent),
      agentKey: formatAgentToken(agent._id.toString(), rawSecret)
    });
  } catch (err) {
    next(err);
  }
});

// Revoke an agent's credential. The agent can no longer authenticate; the
// record itself is retained for audit history. Also invalidates any
// outstanding provisioning token so a not-yet-registered agent can't
// complete registration after being revoked.
router.post('/:id/revoke', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId },
      { $set: { status: 'revoked', revokedAt: new Date() } },
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
    }

    await invalidatePendingProvisioningTokens(agent._id);

    res.json({ agent: toAgentSummary(agent) });
  } catch (err) {
    next(err);
  }
});

// Permanently remove an agent record and any outstanding provisioning
// tokens for it. Unlike revoke (which keeps the record for history), this
// deletes it outright — there is no AgentEvent audit trail in this
// milestone, so deletion here is irreversible by design, not an oversight.
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agent = await Agent.findOneAndDelete({ _id: req.params.id, organizationId: orgId });

    if (!agent) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
    }

    await ProvisioningToken.deleteMany({ agentId: agent._id });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
