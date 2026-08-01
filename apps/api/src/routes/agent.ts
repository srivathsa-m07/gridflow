import { Router } from 'express';
import { validateAgentMetrics } from '../middleware/validate';
import { agentAuthMiddleware } from '../middleware/agentAuth';
import { handleIncomingMetrics } from '../services/metrics';
import { markAgentOnline } from '../services/agentLifecycle';

const router = Router();

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
