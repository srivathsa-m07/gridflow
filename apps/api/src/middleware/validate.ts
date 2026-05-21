import { Request, Response, NextFunction } from 'express';

export const validateAgentMetrics = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { agentId, hostname, cpu, memory, uptime, organizationId } = req.body;

  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: { message: 'Invalid or missing agentId' } });
  }
  if (!hostname || typeof hostname !== 'string') {
    return res.status(400).json({ error: { message: 'Invalid or missing hostname' } });
  }
  if (typeof cpu !== 'number' || cpu < 0 || cpu > 100) {
    return res.status(400).json({ error: { message: 'Invalid cpu load (must be 0-100)' } });
  }
  if (typeof memory !== 'number' || memory < 0 || memory > 100) {
    return res.status(400).json({ error: { message: 'Invalid memory usage (must be 0-100)' } });
  }
  if (typeof uptime !== 'number' || uptime < 0) {
    return res.status(400).json({ error: { message: 'Invalid uptime (must be >= 0)' } });
  }
  if (organizationId !== undefined && typeof organizationId !== 'string') {
    return res.status(400).json({ error: { message: 'Invalid organizationId' } });
  }

  next();
};
