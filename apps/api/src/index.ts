import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socket';
import { startSelfMonitoring } from './services/metrics';
import { getAgents, startAgentOfflineDetection } from './services/agentRegistry';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

import agentRoutes from './routes/agent';
import metricsRoutes from './routes/metrics';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Routes registration
app.use('/api/agent', agentRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check endpoints
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from GRIDFLOW API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/agents', (req, res) => {
  res.json(getAgents());
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect Database
connectDB().then(() => {
  // Start telemetry loops
  startSelfMonitoring();
  startAgentOfflineDetection();

  httpServer.listen(env.PORT, () => {
    logger.info(`GRIDFLOW API server successfully booted on port ${env.PORT} [${env.NODE_ENV}]`);
  });
});
