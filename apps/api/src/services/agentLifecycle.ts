import { Agent } from '../models/Agent';
import { logger } from '../utils/logger';

// Matches the existing in-memory offline-detection threshold in
// agentRegistry.ts — this is the same heartbeat cadence, just persisted.
const OFFLINE_THRESHOLD_MS = 15000;
const SWEEP_INTERVAL_MS = 5000;

/**
 * CREATED -> ONLINE / OFFLINE -> ONLINE.
 * Called on every accepted metrics submission, which today doubles as the
 * agent's heartbeat signal. Revoked agents never reach this call because
 * agentAuthMiddleware rejects them before the route handler runs.
 */
export const markAgentOnline = async (agentId: string): Promise<void> => {
  await Agent.updateOne(
    { _id: agentId, status: { $ne: 'revoked' } },
    { $set: { status: 'online', lastHeartbeatAt: new Date() } }
  );
};

/**
 * ONLINE -> OFFLINE.
 * Periodic sweep against the persisted lastHeartbeatAt — MongoDB is the
 * source of truth for this transition, independent of any in-memory state.
 */
export const sweepOfflineAgents = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - OFFLINE_THRESHOLD_MS);
  const result = await Agent.updateMany(
    { status: 'online', lastHeartbeatAt: { $lt: cutoff } },
    { $set: { status: 'offline' } }
  );
  return result.modifiedCount || 0;
};

export const startAgentLifecycleSweep = (): NodeJS.Timeout => {
  return setInterval(async () => {
    try {
      const transitioned = await sweepOfflineAgents();
      if (transitioned > 0) {
        logger.warn(`[LIFECYCLE] Transitioned ${transitioned} agent(s) to offline`);
      }
    } catch (err: any) {
      logger.error(`[LIFECYCLE] Offline sweep failed: ${err?.message || err}`);
    }
  }, SWEEP_INTERVAL_MS);
};
