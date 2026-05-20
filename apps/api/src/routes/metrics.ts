import { Router } from 'express';
import { getRealMetrics } from '../services/metrics';
import { Metric } from '../models/Metric';
import { Incident } from '../models/Incident';

const router = Router();

router.get('/live', async (req, res, next) => {
  try {
    const metrics = await getRealMetrics();
    res.json(metrics || { error: 'Failed to fetch metrics' });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const history = await Metric.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/incidents', async (req, res, next) => {
  try {
    const incidents = await Incident.find().sort({ timestamp: -1 }).limit(10);
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

export default router;
