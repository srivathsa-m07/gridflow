import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  GEMINI_API_KEY?: string;
  NODE_ENV: string;
}

const getEnv = (): EnvConfig => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    logger.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables! App exiting...');
    process.exit(1);
  }

  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    MONGODB_URI,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
};

export const env = getEnv();
