import { Incident } from '../models/Incident';
import { generateIncidentSummary } from './ai';
import { getIO } from '../sockets/socket';
import { logger } from '../utils/logger';

const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000;

export const processIncidentDetection = async (metrics: {
  agentId: string;
  hostname: string;
  cpu: number;
  memory: number;
  organizationId?: string;
}) => {
  const { agentId, hostname, cpu, memory, organizationId } = metrics;
  
  if (cpu > 80) {
    await triggerIncident('HIGH_CPU', cpu, agentId, hostname, organizationId);
  }
  if (memory > 80) {
    await triggerIncident('HIGH_MEMORY', memory, agentId, hostname, organizationId);
  }
};

const triggerIncident = async (
  type: 'HIGH_CPU' | 'HIGH_MEMORY',
  value: number,
  agentId: string,
  hostname: string,
  organizationId?: string
) => {
  const key = `${agentId}:${type}`;
  const now = Date.now();
  const lastTriggered = cooldowns.get(key);

  if (lastTriggered && now - lastTriggered < COOLDOWN_MS) {
    return;
  }

  cooldowns.set(key, now);
  logger.warn(`Incident detected: ${type} on ${agentId} (${value}%)`);

  const aiSummary = await generateIncidentSummary(type, agentId, hostname, value);

  const incidentData = {
    incidentId: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    severity: 'critical' as const,
    message: `${type === 'HIGH_CPU' ? 'High CPU' : 'High Memory'} usage detected: ${value}%`,
    agentId,
    hostname,
    aiSummary,
    timestamp: new Date(),
    organizationId
  };

  try {
    await Incident.create(incidentData);
    logger.info(`Incident successfully logged: ${incidentData.incidentId}`);
  } catch (error) {
    logger.error(`Failed to save incident: ${error}`);
  }

  const io = getIO();
  if (io) {
    if (organizationId) {
      io.to(organizationId).emit('incident', incidentData);
    } else {
      io.emit('incident', incidentData);
    }
  }
};
