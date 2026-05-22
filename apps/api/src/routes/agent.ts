import { Router } from 'express';
import { validateAgentMetrics } from '../middleware/validate';
import { handleIncomingMetrics } from '../services/metrics';
import { Agent } from '../models/Agent';

const router = Router();

router.post('/metrics', validateAgentMetrics, async (req, res, next) => {
  try {
    const { agentKey, hostname, cpu, memory, uptime } = req.body;

    if (!agentKey || typeof agentKey !== 'string') {
      return res.status(401).json({ error: { message: 'Missing agentKey' } });
    }

    const agent = await Agent.findOne({ agentKey });
    if (!agent) {
      return res.status(401).json({ error: { message: 'Invalid agentKey' } });
    }

    const payload = {
      agentId: agent._id.toString(),
      hostname: hostname || agent.hostname || 'unknown',
      cpu,
      memory,
      uptime,
      organizationId: agent.organizationId?.toString()
    };

    const enriched = await handleIncomingMetrics(payload);
    res.status(200).json({ status: 'ok', data: enriched });
  } catch (error) {
    next(error);
  }
});

export default router;
