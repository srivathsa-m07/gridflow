import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Milestone 2A migration.
 *
 * The Agent collection previously tracked revocation via a boolean `revoked`
 * field. The schema now models the full lifecycle (`created` | `online` |
 * `offline` | `revoked`) via a single `status` field, with `lastHeartbeatAt`
 * as the persisted signal the offline sweep reads. This migration backfills
 * `status` for any document that predates the new field, then drops the
 * legacy boolean.
 */
export const run = async (): Promise<{ migrated: number }> => {
  const collection = mongoose.connection.collection('agents');

  const cursor = collection.find({ status: { $exists: false } });

  let migrated = 0;

  for await (const doc of cursor) {
    const status = doc.revoked === true ? 'revoked' : 'created';

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: { status },
        $unset: { revoked: '' }
      }
    );

    migrated += 1;
  }

  logger.info(`[MIGRATION 002] Backfilled lifecycle status on ${migrated} agent(s).`);
  return { migrated };
};
