import { Metrics, IncidentData, AgentData, AgentRecord, AgentPendingProvisioning, InstallCommandResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_URL}/api`;
const TOKEN_KEY = 'GRIDFLOW_AUTH_TOKEN';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token?: string) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message || res.statusText || 'Request failed';
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }
  return data;
};

const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  return handleResponse(response);
};

export const apiService = {
  login: async (email: string, password: string) => {
    const body = JSON.stringify({ email, password });
    const result = await fetchWithAuth('/auth/login', { method: 'POST', body });
    if (result?.token) setToken(result.token);
    return result;
  },

  signup: async (name: string, email: string, password: string, organizationName: string) => {
    const body = JSON.stringify({ name, email, password, organizationName });
    const result = await fetchWithAuth('/auth/signup', { method: 'POST', body });
    if (result?.token) setToken(result.token);
    return result;
  },

  logout: () => {
    setToken(undefined);
  },

  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  },

  fetchHistory: async (): Promise<Metrics[]> => {
    return fetchWithAuth('/metrics/history');
  },

  fetchIncidents: async (): Promise<IncidentData[]> => {
    return fetchWithAuth('/metrics/incidents');
  },

  fetchAgents: async (): Promise<AgentData[]> => {
    return fetchWithAuth('/agents');
  },

  createAgent: async (name: string, hostname?: string, backendUrl?: string) => {
    const body = JSON.stringify({ name, hostname, backendUrl });
    const res = await fetchWithAuth('/agents/create', { method: 'POST', body });
    return res;
  },

  // Agent Management (Agents page) — see AgentRecord in types/index.ts.
  listAgents: async (): Promise<AgentRecord[]> => {
    return fetchWithAuth('/agents');
  },

  getAgent: async (id: string): Promise<{ agent: AgentRecord; pendingProvisioning: AgentPendingProvisioning | null }> => {
    return fetchWithAuth(`/agents/${id}`);
  },

  // Re-generates a fresh, single-use provisioning token and the install
  // commands that embed it — the same backend endpoint used by the initial
  // onboarding flow.
  getInstallCommand: async (id: string, backendUrl?: string): Promise<InstallCommandResponse> => {
    const query = backendUrl ? `?backendUrl=${encodeURIComponent(backendUrl)}` : '';
    return fetchWithAuth(`/agents/${id}/install-command${query}`);
  },

  rotateAgentKey: async (id: string): Promise<{ agent: AgentRecord; agentKey: string }> => {
    return fetchWithAuth(`/agents/${id}/rotate-key`, { method: 'POST' });
  },

  revokeAgent: async (id: string): Promise<{ agent: AgentRecord }> => {
    return fetchWithAuth(`/agents/${id}/revoke`, { method: 'POST' });
  },

  deleteAgent: async (id: string): Promise<void> => {
    await fetchWithAuth(`/agents/${id}`, { method: 'DELETE' });
  },

  fetchNotificationSettings: async () => {
    return fetchWithAuth('/settings/notifications');
  },

  saveNotificationSettings: async (settings: { discordWebhookUrl: string; slackWebhookUrl: string }) => {
    return fetchWithAuth('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};
