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
  organizationId?: string;
}

const agentsRegistry = new Map<string, AgentData>();

const INTERNAL_AGENT_IDS = new Set(['backend-self']);

export const updateAgent = (
  agentId: string,
  hostname: string,
  metrics: { cpu: number; memory: number; uptime: number; status: 'healthy' | 'warning' | 'critical' },
  organizationId?: string
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
    isOnline: true,
    organizationId
  };

  agentsRegistry.set(agentId, agentData);

  // Only broadcast to org-scoped rooms; internal agents are never pushed to customers
  const io = getIO();
  if (io && organizationId && !INTERNAL_AGENT_IDS.has(agentId)) {
    io.to(organizationId).emit('agent_registry_update',
      Array.from(agentsRegistry.values()).filter(a => a.organizationId === organizationId)
    );
  }
};

export const getAgents = (organizationId?: string): AgentData[] => {
  return Array.from(agentsRegistry.values()).filter((agent) => {
    if (!organizationId) return true;
    return agent.organizationId === organizationId;
  });
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
        // Broadcast per-org filtered registry; never expose internal agents
        const orgIds = new Set(
          Array.from(agentsRegistry.values())
            .filter(a => a.organizationId && !INTERNAL_AGENT_IDS.has(a.agentId))
            .map(a => a.organizationId as string)
        );
        for (const orgId of orgIds) {
          io.to(orgId).emit('agent_registry_update',
            Array.from(agentsRegistry.values()).filter(a => a.organizationId === orgId)
          );
        }
      }
    }
  }, 5000); // Check every 5 seconds
};
