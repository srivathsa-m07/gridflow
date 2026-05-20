import { Metrics, IncidentData, AgentData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
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
    const res = await fetch(`${API_BASE_URL}/metrics/history`);
    if (!res.ok) {
      throw new Error(`Failed to fetch history: ${res.statusText}`);
    }
    return res.json();
  },

  fetchIncidents: async (): Promise<IncidentData[]> => {
    const res = await fetch(`${API_BASE_URL}/metrics/incidents`);
    if (!res.ok) {
      throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    }
    return res.json();
  },

  fetchAgents: async (): Promise<AgentData[]> => {
    const res = await fetch(`${API_BASE_URL}/agents`);
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.statusText}`);
    }
    return res.json();
  }
};
