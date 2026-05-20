import si from 'systeminformation';
import { Metric } from '../models/Metric';
import { getIO } from '../sockets/socket';
import mongoose from 'mongoose';
import { processIncidentDetection } from './incidents';
import { logger } from '../utils/logger';
import { updateAgent } from './agentRegistry';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  uptime: number;
  status: 'healthy' | 'warning' | 'critical';
}

export const getRealMetrics = async (): Promise<SystemMetrics | null> => {
  try {
    const [load, mem, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time()
    ]);

    const cpu = Math.round(load.currentLoad * 10) / 10;
    const memory = Math.round((mem.active / mem.total) * 100 * 10) / 10;
    const uptime = Math.round((time.uptime / 3600) * 10) / 10;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (cpu > 80 || memory > 80) {
      status = 'critical';
    } else if (cpu > 50 || memory > 50) {
      status = 'warning';
    }

    return { cpu, memory, uptime, status };
  } catch (error) {
    logger.error(`Error fetching system metrics: ${error}`);
    return null;
  }
};

export const handleIncomingMetrics = async (payload: {
  agentId: string;
  hostname: string;
  cpu: number;
  memory: number;
  uptime: number;
}) => {
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (payload.cpu > 80 || payload.memory > 80) {
    status = 'critical';
  } else if (payload.cpu > 50 || payload.memory > 50) {
    status = 'warning';
  }

  const enrichedMetrics = {
    ...payload,
    status,
    timestamp: new Date()
  };

  const io = getIO();
  if (io) {
    io.emit('metrics_update', enrichedMetrics);
    
    if (payload.cpu > 80) {
      io.emit('alert', {
        type: 'HIGH_CPU',
        message: `High CPU usage detected on agent: ${payload.agentId} (${payload.hostname})`
      });
    }
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Metric.create({
        cpu: payload.cpu,
        memory: payload.memory,
        uptime: payload.uptime,
        status,
        agentId: payload.agentId,
        hostname: payload.hostname,
        timestamp: enrichedMetrics.timestamp
      });
    } catch (err) {
      logger.error(`Error saving agent metrics to MongoDB: ${err}`);
    }
  }

  updateAgent(payload.agentId, payload.hostname, {
    cpu: payload.cpu,
    memory: payload.memory,
    uptime: payload.uptime,
    status
  });

  processIncidentDetection({
    agentId: payload.agentId,
    hostname: payload.hostname,
    cpu: payload.cpu,
    memory: payload.memory
  }).catch(err => logger.error(`Incident detection error: ${err}`));

  return enrichedMetrics;
};

export const startSelfMonitoring = () => {
  setInterval(async () => {
    const metrics = await getRealMetrics();
    if (metrics) {
      await handleIncomingMetrics({
        agentId: 'backend-self',
        hostname: 'localhost',
        cpu: metrics.cpu,
        memory: metrics.memory,
        uptime: metrics.uptime
      });
    }
  }, 3000);
};
