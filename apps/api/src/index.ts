import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socket';
import { startSelfMonitoring } from './services/metrics';
import { getAgents, startAgentOfflineDetection } from './services/agentRegistry';
import { startAgentLifecycleSweep } from './services/agentLifecycle';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

import authRoutes from './routes/auth';
import agentRoutes from './routes/agent';
import metricsRoutes from './routes/metrics';
import agentsRoutes from './routes/agents';
import settingsRoutes from './routes/settings';
import { authMiddleware } from './middleware/auth';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Routes registration
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoints
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from GRIDFLOW API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// persistent agents are exposed via /api/agents routes

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect Database
connectDB().then(() => {
  // Start telemetry loops
  startSelfMonitoring();
  startAgentOfflineDetection();
  startAgentLifecycleSweep();

  httpServer.listen(env.PORT, () => {
    logger.info(`GRIDFLOW API server successfully booted on port ${env.PORT} [${env.NODE_ENV}]`);
  });
});
