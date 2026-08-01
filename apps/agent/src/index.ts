import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import os from 'os';
import si from 'systeminformation';
import { logger } from './utils/logger';

const BACKEND_URL = process.env.BACKEND_URL;
const PROVISIONING_TOKEN = process.env.PROVISIONING_TOKEN;
// Legacy/manual path: an already-permanent credential (e.g. issued by
// rotate-key) supplied directly, bypassing registration entirely.
const LEGACY_AGENT_KEY = process.env.AGENT_KEY;
const CREDENTIALS_PATH = process.env.AGENT_CREDENTIALS_PATH || './.gridflow-agent-credentials.json';
const HOSTNAME = os.hostname();

if (!BACKEND_URL) {
  logger.error('[STARTUP] ✗ BACKEND_URL environment variable is missing. Cannot initialize agent.');
  process.exit(1);
}

interface StoredCredentials {
  agentKey: string;
}

const loadStoredCredentials = (): StoredCredentials | null => {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) return null;
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.agentKey === 'string') return { agentKey: parsed.agentKey };
    return null;
  } catch (error: any) {
    logger.warn(`[STARTUP] Could not read stored credentials at ${CREDENTIALS_PATH}: ${error?.message || error}`);
    return null;
  }
};

const persistCredentials = (agentKey: string) => {
  try {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify({ agentKey }), { mode: 0o600 });
  } catch (error: any) {
    logger.warn(`[STARTUP] Could not persist credentials to ${CREDENTIALS_PATH}: ${error?.message || error}`);
  }
};

// Exchanges a short-lived provisioning token for the agent's permanent
// credential. Only ever runs once per install — the resulting credential is
// persisted locally and reused on every subsequent restart, since the
// provisioning token itself is single-use and cannot be exchanged again.
const registerAgent = async (provisioningToken: string): Promise<string> => {
  const response = await fetch(`${BACKEND_URL}/api/agent/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provisioningToken}`
    },
    body: JSON.stringify({ hostname: HOSTNAME })
  });

  if (!response.ok) {
    const body: any = await response.json().catch(() => null);
    throw new Error(body?.error?.message || `Registration failed: ${response.statusText}`);
  }

  const data: any = await response.json();
  if (typeof data?.agentKey !== 'string') {
    throw new Error('Registration response did not include an agentKey');
  }

  return data.agentKey;
};

const resolveAgentKey = async (): Promise<string> => {
  const stored = loadStoredCredentials();
  if (stored) {
    logger.info('[STARTUP] ✓ Loaded previously registered credential from disk');
    return stored.agentKey;
  }

  if (LEGACY_AGENT_KEY) {
    logger.info('[STARTUP] ✓ Using AGENT_KEY supplied directly (registration skipped)');
    return LEGACY_AGENT_KEY;
  }

  if (PROVISIONING_TOKEN) {
    logger.info('[STARTUP] Exchanging provisioning token for a permanent credential...');
    const agentKey = await registerAgent(PROVISIONING_TOKEN);
    persistCredentials(agentKey);
    logger.info('[STARTUP] ✓ Registration complete, credential persisted for future restarts');
    return agentKey;
  }

  logger.error('[STARTUP] ✗ No credential available. Set PROVISIONING_TOKEN (first install) or AGENT_KEY (manual/rotated credential).');
  process.exit(1);
};

const main = async () => {
  const AGENT_KEY = await resolveAgentKey();

  logger.info(`[STARTUP] ✓ Agent initialized on hostname: ${HOSTNAME}`);
  logger.info(`[STARTUP] ✓ Backend gateway: ${BACKEND_URL}`);
  logger.info(`[STARTUP] ✓ Heartbeat interval: 5 seconds`);
  logger.info(`[STARTUP] ✓ Telemetry interval: 5 seconds`);

  // Lightweight liveness signal, sent independently of telemetry so the
  // server's online/offline lifecycle doesn't depend on metrics collection
  // succeeding.
  const sendHeartbeat = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/agent/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AGENT_KEY}`
        }
      });

      if (!response.ok) {
        logger.warn(`[HEARTBEAT] Transmission failed: ${response.statusText}`);
      }
    } catch (error: any) {
      logger.error(`[HEARTBEAT] ✗ ${error?.message || error}`);
    }
  };

  const collectAndSendMetrics = async () => {
    try {
      const [load, mem, time] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.time()
      ]);

      const payload = {
        hostname: HOSTNAME,
        cpu: Math.round(load.currentLoad * 10) / 10,
        memory: Math.round((mem.active / mem.total) * 100 * 10) / 10,
        uptime: Math.round((time.uptime / 3600) * 10) / 10
      };

      const response = await fetch(`${BACKEND_URL}/api/agent/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AGENT_KEY}`
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

  // Heartbeat and telemetry run on independent timers/requests — a slow or
  // failing metrics collection cycle must not delay or block the heartbeat.
  setInterval(sendHeartbeat, 5000);
  setInterval(collectAndSendMetrics, 5000);

  // Send both immediately on startup
  sendHeartbeat();
  collectAndSendMetrics();
};

main().catch((error: any) => {
  logger.error(`[STARTUP] ✗ ${error?.message || error}`);
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('[SHUTDOWN] SIGTERM received, gracefully shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[SHUTDOWN] SIGINT received, gracefully shutting down...');
  process.exit(0);
});
