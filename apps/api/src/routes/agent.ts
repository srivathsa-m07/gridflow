import { Router } from 'express';
import { validateAgentMetrics } from '../middleware/validate';
import { handleIncomingMetrics } from '../services/metrics';

const router = Router();

router.post('/metrics', validateAgentMetrics, async (req, res, next) => {
  try {
    const enriched = await handleIncomingMetrics(req.body);
    res.status(200).json({ status: 'ok', data: enriched });
  } catch (error) {
    next(error);
  }
});

export default router;
