import { Router } from 'express';
import { Organization } from '../models/Organization';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/notifications', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: { message: 'Organization context is required' } });
    }

    const organization = await Organization.findById(orgId).lean();
    if (!organization) {
      return res.status(404).json({ error: { message: 'Organization not found' } });
    }

    res.json({
      discordWebhookUrl: organization.discordWebhookUrl || '',
      slackWebhookUrl: organization.slackWebhookUrl || ''
    });
  } catch (error) {
    next(error);
  }
});

router.put('/notifications', authMiddleware, async (req, res, next) => {
  try {
    const orgId = req.user?.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: { message: 'Organization context is required' } });
    }

    const { discordWebhookUrl, slackWebhookUrl } = req.body;
    if (discordWebhookUrl !== undefined && typeof discordWebhookUrl !== 'string') {
      return res.status(400).json({ error: { message: 'discordWebhookUrl must be a string' } });
    }
    if (slackWebhookUrl !== undefined && typeof slackWebhookUrl !== 'string') {
      return res.status(400).json({ error: { message: 'slackWebhookUrl must be a string' } });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ error: { message: 'Organization not found' } });
    }

    organization.discordWebhookUrl = discordWebhookUrl?.trim() || '';
    organization.slackWebhookUrl = slackWebhookUrl?.trim() || '';
    await organization.save();

    res.json({
      discordWebhookUrl: organization.discordWebhookUrl || '',
      slackWebhookUrl: organization.slackWebhookUrl || ''
    });
  } catch (error) {
    next(error);
  }
});

export default router;
