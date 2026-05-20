import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err?.message || err}`);
    process.exit(1);
  }
};
