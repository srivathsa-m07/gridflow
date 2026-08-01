import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Agent } from '../models/Agent';
import { generateAgentSecret, hashSecret, formatAgentToken } from '../utils/secrets';

const router = Router();

const toAgentSummary = (agent: {
  _id: unknown;
  name: string;
  hostname?: string;
  createdAt: Date;
  status: string;
  lastHeartbeatAt?: Date;
  revokedAt?: Date;
  secretRotatedAt: Date;
}) => ({
  id: agent._id,
  name: agent.name,
  hostname: agent.hostname,
  createdAt: agent.createdAt,
  status: agent.status,
  lastHeartbeatAt: agent.lastHeartbeatAt,
  revokedAt: agent.revokedAt,
  secretRotatedAt: agent.secretRotatedAt
});

// List agents for organization
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agents = await Agent.find({ organizationId: orgId }).select('-secretHash');
    res.json(agents);
  } catch (err) {
    next(err);
  }
});

// Create agent for organization
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const { name, hostname } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: { message: 'Agent name is required' } });
    }

    const rawSecret = generateAgentSecret();
    const secretHash = await hashSecret(rawSecret);

    const agent = await Agent.create({
      name: name.trim(),
      secretHash,
      organizationId: orgId,
      hostname: hostname || undefined
    });

    // Return the bearer token once; only its bcrypt hash is ever persisted.
    res.status(201).json({
      agent: toAgentSummary(agent),
      agentKey: formatAgentToken(agent._id.toString(), rawSecret)
    });
  } catch (err) {
    next(err);
  }
});

// Rotate an agent's secret. Invalidates the previous credential immediately
// and returns the new bearer token once. Uses an atomic findOneAndUpdate
// (rather than find + mutate + save) so two concurrent rotate requests can't
// silently clobber each other's read state.
router.post('/:id/rotate-key', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const rawSecret = generateAgentSecret();
    const secretHash = await hashSecret(rawSecret);

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId, status: { $ne: 'revoked' } },
      { $set: { secretHash, secretRotatedAt: new Date() } },
      { new: true }
    );

    if (!agent) {
      const exists = await Agent.exists({ _id: req.params.id, organizationId: orgId });
      if (!exists) {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      return res.status(409).json({ error: { message: 'Cannot rotate the key of a revoked agent' } });
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
// record itself is retained for audit history.
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

    res.json({ agent: toAgentSummary(agent) });
  } catch (err) {
    next(err);
  }
});

export default router;
