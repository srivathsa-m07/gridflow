import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { hashSecret } from '../utils/secrets';

/**
 * Milestone 1 migration.
 *
 * The Agent collection previously stored a plaintext `agentKey` field. The
 * schema now stores only `secretHash` (bcrypt) plus `revoked`/`secretRotatedAt`.
 * This migration hashes any legacy plaintext key in place and backfills the
 * new fields, then removes the plaintext field.
 *
 * NOTE: any agent binary already deployed with the old AGENT_KEY env value
 * must be reprovisioned with the new `<agentId>.<secret>` bearer token
 * returned by POST /api/agents/create or /api/agents/:id/rotate-key, since
 * legacy plaintext keys carried no agentId prefix and authenticated via a
 * request-body field rather than the Authorization header.
 */
export const run = async (): Promise<{ migrated: number; skipped: number }> => {
  const collection = mongoose.connection.collection('agents');

  const cursor = collection.find({
    agentKey: { $exists: true },
    secretHash: { $exists: false }
  });

  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    if (typeof doc.agentKey !== 'string' || doc.agentKey.length === 0) {
      skipped += 1;
      continue;
    }

    const secretHash = await hashSecret(doc.agentKey);

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          secretHash,
          revoked: false,
          secretRotatedAt: new Date()
        },
        $unset: { agentKey: '' }
      }
    );

    migrated += 1;
  }

  logger.info(`[MIGRATION 001] Hashed ${migrated} legacy agent secret(s), skipped ${skipped} invalid record(s).`);
  return { migrated, skipped };
};
