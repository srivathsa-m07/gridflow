import { Metrics, IncidentData, AgentData } from '../types';

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

  createAgent: async (name: string, hostname?: string) => {
    const body = JSON.stringify({ name, hostname });
    const res = await fetchWithAuth('/agents/create', { method: 'POST', body });
    return res;
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
