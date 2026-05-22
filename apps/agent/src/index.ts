import dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import si from 'systeminformation';
import { logger } from './utils/logger';

const BACKEND_URL = process.env.BACKEND_URL;
const AGENT_KEY = process.env.AGENT_KEY;
const HOSTNAME = os.hostname();

if (!BACKEND_URL) {
  logger.error('CRITICAL CONFIG ERROR: BACKEND_URL is not defined in the environment variables! Agent exiting...');
  process.exit(1);
}

if (!AGENT_KEY) {
  logger.error('CRITICAL CONFIG ERROR: AGENT_KEY is not defined in the environment variables! Agent exiting...');
  process.exit(1);
}

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
      logger.warn(`Failed to send operational telemetry: ${response.statusText}`);
    } else {
      logger.info(`Telemetry metrics transmitted successfully to backend for key ${AGENT_KEY} (${HOSTNAME})`);
    }
  } catch (error: any) {
    logger.error(`Error collecting/transmitting operational metrics: ${error?.message || error}`);
  }
};

// Run every 5 seconds
setInterval(collectAndSendMetrics, 5000);

logger.info(`GRIDFLOW agent successfully initialized on hostname ${HOSTNAME}`);
logger.info(`Streaming telemetry to backend gateway at ${BACKEND_URL} every 5 seconds`);

// Execute once immediately on launch
collectAndSendMetrics();
