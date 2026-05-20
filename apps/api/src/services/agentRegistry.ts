import { getIO } from '../sockets/socket';
import { logger } from '../utils/logger';

export interface AgentData {
  agentId: string;
  hostname: string;
  cpu: number;
  memory: number;
  uptime: number;
  status: 'healthy' | 'warning' | 'critical';
  lastSeen: Date;
  isOnline: boolean;
}

const agentsRegistry = new Map<string, AgentData>();

export const updateAgent = (
  agentId: string,
  hostname: string,
  metrics: { cpu: number; memory: number; uptime: number; status: 'healthy' | 'warning' | 'critical' }
) => {
  const existingAgent = agentsRegistry.get(agentId);
  const now = new Date();
  
  if (!existingAgent || !existingAgent.isOnline) {
    logger.info(`Agent came online: ${agentId} (${hostname})`);
  }

  const agentData: AgentData = {
    agentId,
    hostname,
    ...metrics,
    lastSeen: now,
    isOnline: true
  };

  agentsRegistry.set(agentId, agentData);
  
  // Optional: broadcast updated agent registry
  const io = getIO();
  if (io) {
    io.emit('agent_registry_update', Array.from(agentsRegistry.values()));
  }
};

export const getAgents = (): AgentData[] => {
  return Array.from(agentsRegistry.values());
};

export const startAgentOfflineDetection = () => {
  setInterval(() => {
    const now = new Date().getTime();
    let registryChanged = false;

    for (const [agentId, agent] of agentsRegistry.entries()) {
      if (agent.isOnline && now - agent.lastSeen.getTime() > 15000) {
        agent.isOnline = false;
        registryChanged = true;
        logger.warn(`Agent went offline: ${agentId}`);
      }
    }

    if (registryChanged) {
      const io = getIO();
      if (io) {
        io.emit('agent_registry_update', Array.from(agentsRegistry.values()));
      }
    }
  }, 5000); // Check every 5 seconds
};
