import { Router } from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';
import { Agent } from '../models/Agent';

const router = Router();

// List agents for organization
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    const agents = await Agent.find({ organizationId: orgId }).select('-agentKey');
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

    // secure random key
    const agentKey = crypto.randomBytes(32).toString('hex');

    const agent = await Agent.create({
      name: name.trim(),
      agentKey,
      organizationId: orgId,
      hostname: hostname || undefined
    });

    // return the key once (do not expose persistently)
    res.status(201).json({
      agent: { id: agent._id, name: agent.name, createdAt: agent.createdAt },
      agentKey
    });
  } catch (err) {
    next(err);
  }
});

export default router;
