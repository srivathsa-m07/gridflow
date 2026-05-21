import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  GEMINI_API_KEY?: string;
  NODE_ENV: string;
}

const getEnv = (): EnvConfig => {
  const MONGODB_URI = process.env.MONGODB_URI;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!MONGODB_URI) {
    logger.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables! App exiting...');
    process.exit(1);
  }

  if (!JWT_SECRET) {
    logger.error('CRITICAL ERROR: JWT_SECRET is not defined in the environment variables! App exiting...');
    process.exit(1);
  }

  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    MONGODB_URI,
    JWT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
};

export const env = getEnv();
