import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { run as runHashAgentSecrets } from './001_hash_agent_secrets';
import { run as runAgentLifecycleStatus } from './002_agent_lifecycle_status';

const migrations: Array<{ id: string; run: () => Promise<unknown> }> = [
  { id: '001_hash_agent_secrets', run: runHashAgentSecrets },
  { id: '002_agent_lifecycle_status', run: runAgentLifecycleStatus }
];

const main = async () => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('[MIGRATIONS] Connected to MongoDB');

  for (const migration of migrations) {
    logger.info(`[MIGRATIONS] Running ${migration.id}...`);
    await migration.run();
  }

  logger.info('[MIGRATIONS] Complete');
  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  logger.error(`[MIGRATIONS] Failed: ${err?.message || err}`);
  process.exit(1);
});
