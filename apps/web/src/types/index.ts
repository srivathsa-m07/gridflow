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
