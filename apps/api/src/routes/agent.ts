import { Router } from 'express';
import { validateAgentMetrics } from '../middleware/validate';
import { agentAuthMiddleware } from '../middleware/agentAuth';
import { handleIncomingMetrics } from '../services/metrics';
import { markAgentOnline } from '../services/agentLifecycle';
import { consumeProvisioningToken } from '../services/provisioning';
import { Agent } from '../models/Agent';
import { generateAgentSecret, hashSecret, formatAgentToken } from '../utils/secrets';

const router = Router();

// Exchanges a short-lived, single-use provisioning token (minted by
// POST /api/agents/create or /api/agents/:id/install-command) for the
// agent's permanent credential. This is the second phase of two-phase
// provisioning — the permanent secret is generated here, for the first
// time, and returned exactly once.
router.post('/register', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const provisioningToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

    if (!provisioningToken) {
      return res.status(401).json({ error: { message: 'Provisioning token required' } });
    }

    const result = await consumeProvisioningToken(provisioningToken);
    if (!result.ok) {
      return res.status(401).json({ error: { message: 'Invalid, expired, or already-used provisioning token' } });
    }

    const { hostname } = req.body || {};

    const rawSecret = generateAgentSecret();
    const secretHash = await hashSecret(rawSecret);

    // The agent may already be revoked between token issuance and this
    // exchange (e.g. an operator revoked it while the install command was
    // still sitting in someone's terminal history) — never hand out a live
    // credential for a revoked agent.
    const agent = await Agent.findOneAndUpdate(
      { _id: result.agentId, organizationId: result.organizationId, status: { $ne: 'revoked' } },
      {
        $set: {
          secretHash,
          secretRotatedAt: new Date(),
          ...(hostname && typeof hostname === 'string' ? { hostname } : {})
        }
      },
      { new: true }
    );

    if (!agent) {
      return res.status(409).json({ error: { message: 'Agent is no longer available for registration' } });
    }

    res.status(201).json({
      agentId: agent._id.toString(),
      agentKey: formatAgentToken(agent._id.toString(), rawSecret)
    });
  } catch (error) {
    next(error);
  }
});

// Dedicated, lightweight liveness signal — no telemetry payload, no validation
// beyond auth. agentAuthMiddleware already rejects revoked/invalid/missing
// credentials before this handler ever runs, so a revoked agent cannot mark
// itself online via this route.
router.post('/heartbeat', agentAuthMiddleware, async (req, res, next) => {
  try {
    const agent = req.agent!;
    await markAgentOnline(agent._id.toString());
    res.status(200).json({ status: 'ok', lastHeartbeatAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

router.post('/metrics', agentAuthMiddleware, validateAgentMetrics, async (req, res, next) => {
  try {
    const { hostname, cpu, memory, uptime } = req.body;
    const agent = req.agent!;

    const payload = {
      agentId: agent._id.toString(),
      hostname: hostname || agent.hostname || 'unknown',
      cpu,
      memory,
      uptime,
      organizationId: agent.organizationId?.toString()
    };

    // Metrics ingestion is telemetry-focused; the dedicated /heartbeat route
    // is now the primary liveness signal. This call is kept only as a
    // backward-compatible fallback so an agent that only ever hits /metrics
    // (a transitional or pre-2B binary) still keeps its lifecycle status
    // current — see architecture doc §5.1.
    await markAgentOnline(agent._id.toString());

    const enriched = await handleIncomingMetrics(payload);
    res.status(200).json({ status: 'ok', data: enriched });
  } catch (error) {
    next(error);
  }
});

export default router;
