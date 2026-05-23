import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import si from 'systeminformation';
import { logger } from './utils/logger';

const BACKEND_URL = process.env.BACKEND_URL;
const AGENT_KEY = process.env.AGENT_KEY;
const HOSTNAME = os.hostname();

// Validate required configuration
if (!BACKEND_URL) {
  logger.error('[STARTUP] ✗ BACKEND_URL environment variable is missing. Cannot initialize agent.');
  process.exit(1);
}

if (!AGENT_KEY) {
  logger.error('[STARTUP] ✗ AGENT_KEY environment variable is missing. Cannot initialize agent.');
  process.exit(1);
}

// Log initialization
logger.info(`[STARTUP] ✓ Agent initialized on hostname: ${HOSTNAME}`);
logger.info(`[STARTUP] ✓ Backend gateway: ${BACKEND_URL}`);
logger.info(`[STARTUP] ✓ Telemetry interval: 5 seconds`);

const collectAndSendMetrics = async () => {
  try {
    const [load, mem, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time()
    ]);

    const payload = {
      agentKey: AGENT_KEY,
      hostname: HOSTNAME,
      cpu: Math.round(load.currentLoad * 10) / 10,
      memory: Math.round((mem.active / mem.total) * 100 * 10) / 10,
      uptime: Math.round((time.uptime / 3600) * 10) / 10
    };

    const response = await fetch(`${BACKEND_URL}/api/agent/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logger.warn(`[TELEMETRY] Transmission failed: ${response.statusText}`);
    } else {
      logger.info(`[TELEMETRY] ✓ Metrics sent (CPU: ${payload.cpu}%, Memory: ${payload.memory}%)`);
    }
  } catch (error: any) {
    logger.error(`[TELEMETRY] ✗ ${error?.message || error}`);
  }
};

// Run telemetry collection every 5 seconds
setInterval(collectAndSendMetrics, 5000);

// Collect metrics immediately on startup
collectAndSendMetrics();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('[SHUTDOWN] SIGTERM received, gracefully shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[SHUTDOWN] SIGINT received, gracefully shutting down...');
  process.exit(0);
});
