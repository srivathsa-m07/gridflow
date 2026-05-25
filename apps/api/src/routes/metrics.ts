import { Router } from 'express';
import { getRealMetrics } from '../services/metrics';
import { Metric } from '../models/Metric';
import { Incident } from '../models/Incident';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/live', authMiddleware, async (req, res, next) => {
  try {
    const metrics = await getRealMetrics();
    res.json(metrics || { error: 'Failed to fetch metrics' });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.json([]);
    // Strict match: only records that belong to this org (excludes unscoped backend-self records)
    const history = await Metric.find({ organizationId: orgId })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/incidents', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) return res.json([]);
    // Strict match: only incidents that belong to this org
    const incidents = await Incident.find({ organizationId: orgId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

export default router;
