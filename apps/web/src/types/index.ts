export interface Metrics {
  cpu: number;
  memory: number;
  uptime: number;
  status: 'healthy' | 'warning' | 'critical';
  agentId?: string;
  hostname?: string;
  timestamp?: string | Date;
  formattedTime?: string;
  organizationId?: string;
}

export interface AlertData {
  id: string;
  type: 'HIGH_CPU';
  message: string;
  timestamp: Date;
}

export interface IncidentData {
  incidentId: string;
  type: 'HIGH_CPU' | 'HIGH_MEMORY';
  severity: 'critical' | 'warning';
  message: string;
  agentId: string;
  hostname: string;
  aiSummary?: string;
  timestamp: string | Date;
  organizationId?: string;
}

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

// Agent Management (Agents page) — the persisted lifecycle record from
// GET/POST /api/agents*, distinct from `AgentData` above (which is the
// live telemetry/registry shape pushed over the metrics socket).
export type AgentLifecycleStatus = 'created' | 'online' | 'offline' | 'revoked';

export interface AgentRecord {
  id: string;
  name: string;
  hostname?: string;
  backendUrl?: string;
  createdAt: string | Date;
  status: AgentLifecycleStatus;
  registered: boolean;
  lastHeartbeatAt?: string | Date;
  revokedAt?: string | Date;
  secretRotatedAt?: string | Date;
}

export interface AgentPendingProvisioning {
  expiresAt: string | Date;
  used: boolean;
}

export interface InstallCommands {
  dockerPull: string;
  dockerRun: string;
  dockerRunSimple: string;
  local: string;
}

export interface InstallCommandResponse {
  agent: AgentRecord;
  agentKey: string;
  provisioningTokenExpiresAt: string | Date;
  commands: InstallCommands;
}

export interface FeedEvent {
  id: string;
  type: 'agent_connected' | 'agent_offline' | 'incident_triggered' | 'agent_provisioned';
  message: string;
  timestamp: string;
  severity?: 'critical' | 'warning' | 'info';
}
