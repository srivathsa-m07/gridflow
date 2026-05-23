import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Database, Clock, Activity, ShieldCheck, ShieldAlert, Shield, RefreshCw, LogIn, UserPlus, LogOut } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { AlertBanner } from './components/AlertBanner';
import { MetricsChart } from './components/MetricsChart';
import { IncidentPanel } from './components/IncidentPanel';
import { InfrastructurePanel } from './components/InfrastructurePanel';
import { AgentOnboardingPanel } from './components/AgentOnboardingPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { TopologyView } from './components/TopologyView';
import { ActivityFeed } from './components/ActivityFeed';
import { apiService } from './services/api';
import { socketService } from './services/socket';
import { Metrics, AlertData, IncidentData, AgentData, FeedEvent } from './types';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<{ name: string; email: string; organizationId: string; organizationName?: string } | null>(null);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<Metrics[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [activityFeed, setActivityFeed] = useState<FeedEvent[]>([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '' });
  const [createdAgent, setCreatedAgent] = useState<{ name: string; agentKey: string; backendUrl: string } | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({ discordWebhookUrl: '', slackWebhookUrl: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const USER_STORAGE_KEY = 'GRIDFLOW_USER_INFO';
  const previousAgents = useRef<Map<string, AgentData>>(new Map());
  const initialAgentLoad = useRef(true);

  const setStoredUser = (value: typeof user | null) => {
    setUser(value);
    if (value) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const clearSession = () => {
    apiService.logout();
    setStoredUser(null);
    setAuthForm({ name: '', email: '', password: '', organizationName: '' });
    setMetrics(null);
    setHistory([]);
    setAlerts([]);
    setIncidents([]);
    setAgents([]);
    setAuthError(null);
    setApiError(null);
    setIsConnected(false);
  };

  const handleUnauthorized = (message: string) => {
    clearSession();
    setAuthError(message);
    setAuthView('login');
  };

  const handleLogout = () => {
    clearSession();
    setAuthView('login');
  };

  const handleAuthResponse = (result: any) => {
    const storedUser = {
      name: result.user?.name || '',
      email: result.user?.email || '',
      organizationId: result.user?.organizationId || '',
      organizationName: result.user?.organizationName
    };
    setStoredUser(storedUser);
  };

  const addFeedEvent = (event: FeedEvent) => {
    setActivityFeed((prev) => [event, ...prev].slice(0, 12));
  };

  const updateAgentRegistry = (nextAgents: AgentData[]) => {
    const existingAgents = previousAgents.current;

    if (!initialAgentLoad.current) {
      nextAgents.forEach((agent) => {
        const previous = existingAgents.get(agent.agentId);

        if (!previous) {
          addFeedEvent({
            id: `feed-${Date.now()}-${agent.agentId}`,
            type: 'agent_provisioned',
            message: `New agent provisioned: ${agent.agentId} (${agent.hostname})`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          });
        } else if (!previous.isOnline && agent.isOnline) {
          addFeedEvent({
            id: `feed-${Date.now()}-${agent.agentId}`,
            type: 'agent_connected',
            message: `Agent back online: ${agent.agentId} (${agent.hostname})`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          });
        } else if (previous.isOnline && !agent.isOnline) {
          addFeedEvent({
            id: `feed-${Date.now()}-${agent.agentId}`,
            type: 'agent_offline',
            message: `Agent offline: ${agent.agentId} (${agent.hostname})`,
            timestamp: new Date().toISOString(),
            severity: 'warning'
          });
        }
      });
    }

    previousAgents.current = new Map(nextAgents.map((agent) => [agent.agentId, agent]));
    initialAgentLoad.current = false;
    setAgents(nextAgents);
  };

  const backendUrl = import.meta.env.VITE_API_URL || '';
  const backendUrlDisplay = backendUrl || 'http://localhost:3001';

  const handleCreateAgent = async () => {
    if (!agentForm.name.trim()) {
      setApiError('Agent name is required to create a new agent.');
      return;
    }

    setApiError(null);
    setIsCreatingAgent(true);

    try {
      const result = await apiService.createAgent(agentForm.name.trim());
      const agentKey = result?.agentKey;
      if (!agentKey) {
        throw new Error('Agent key was not returned from the API.');
      }

      setCreatedAgent({
        name: agentForm.name.trim(),
        agentKey,
        backendUrl: backendUrlDisplay
      });
      setAgentForm({ name: '' });
      setShowAgentForm(false);
      await fetchInitialData();
    } catch (error: any) {
      setApiError(error?.message || 'Failed to create agent');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setApiError(null);
    setIsSavingSettings(true);

    try {
      const saved = await apiService.saveNotificationSettings(notificationSettings);
      setNotificationSettings({
        discordWebhookUrl: saved?.discordWebhookUrl || '',
        slackWebhookUrl: saved?.slackWebhookUrl || ''
      });
    } catch (error: any) {
      setApiError(error?.message || 'Failed to save notification settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setApiError(null);
      setIsLoading(true);

      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('API Gateway is currently unreachable');
      }

      const [historyData, incidentsData, agentsData, notifications] = await Promise.all([
        apiService.fetchHistory(),
        apiService.fetchIncidents(),
        apiService.fetchAgents(),
        apiService.fetchNotificationSettings()
      ]);

      const chronHistory = [...historyData].reverse().map((m) => ({
        ...m,
        formattedTime: m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : ''
      }));

      setHistory(chronHistory);
      setIncidents(incidentsData);
      updateAgentRegistry(agentsData);
      setNotificationSettings({
        discordWebhookUrl: notifications?.discordWebhookUrl || '',
        slackWebhookUrl: notifications?.slackWebhookUrl || ''
      });

      if (chronHistory.length > 0) {
        setMetrics(chronHistory[chronHistory.length - 1]);
      }

      setIsConnected(true);
    } catch (err: any) {
      if (err?.status === 401) {
        handleUnauthorized('Session expired. Please sign in again.');
        return;
      }
      console.error('Failed to boot GRIDFLOW console:', err);
      setApiError(err?.message || 'Failed to sync operational telemetry');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('GRIDFLOW_USER_INFO');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setAuthView('login');
        fetchInitialData();
      } catch {
        localStorage.removeItem('GRIDFLOW_USER_INFO');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setApiError(null);
      console.log('Telemetry Socket.IO tunnel opened successfully');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.warn('Telemetry Socket.IO tunnel closed unexpectedly');
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      console.warn('Socket connection error:', error);
    });

    socket.on('metrics_update', (newMetrics: Metrics) => {
      if (newMetrics.organizationId && newMetrics.organizationId !== user.organizationId) {
        return;
      }
      const formatted = {
        ...newMetrics,
        formattedTime: newMetrics.timestamp
          ? new Date(newMetrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : ''
      };
      setMetrics(formatted);
      setHistory((prev) => {
        const updated = [...prev, formatted];
        if (updated.length > 20) {
          updated.shift();
        }
        return updated;
      });
    });

    socket.on('agent_registry_update', (updatedAgents: AgentData[]) => {
      const filteredAgents = updatedAgents.filter((agent) => !agent.organizationId || agent.organizationId === user.organizationId);
      updateAgentRegistry(filteredAgents);
    });

    socket.on('alert', (alertPayload: { type: 'HIGH_CPU'; message: string; organizationId?: string }) => {
      if (alertPayload.organizationId && alertPayload.organizationId !== user.organizationId) {
        return;
      }
      setAlerts((prev) => {
        if (prev.some((a) => a.type === alertPayload.type)) {
          return prev;
        }
        const newAlert: AlertData = {
          id: `${Date.now()}-${Math.random()}`,
          type: alertPayload.type,
          message: alertPayload.message,
          timestamp: new Date()
        };
        return [...prev, newAlert];
      });
    });

    socket.on('incident', (newIncident: IncidentData) => {
      if ((newIncident as any).organizationId && (newIncident as any).organizationId !== user.organizationId) {
        return;
      }
      setIncidents((prev) => {
        if (prev.some((i) => i.incidentId === newIncident.incidentId)) {
          return prev;
        }
        return [newIncident, ...prev];
      });
      addFeedEvent({
        id: `feed-${newIncident.incidentId}`,
        type: 'incident_triggered',
        message: `Incident triggered on ${newIncident.agentId} (${newIncident.hostname}): ${newIncident.message}`,
        timestamp: new Date().toISOString(),
        severity: newIncident.severity
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    try {
      const result = await apiService.login(authForm.email, authForm.password);
      handleAuthResponse(result);
      setAuthView('login');
      await fetchInitialData();
    } catch (err: any) {
      if (err?.status === 401) {
        setAuthError('Invalid email or password');
      } else {
        setAuthError(err?.message || 'Login failed');
      }
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);

    try {
      const result = await apiService.signup(
        authForm.name,
        authForm.email,
        authForm.password,
        authForm.organizationName
      );
      handleAuthResponse(result);
      setAuthView('login');
      await fetchInitialData();
    } catch (err: any) {
      setAuthError(err?.message || 'Signup failed');
    }
  };

  const renderAuthForm = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
            {authView === 'signup' ? <UserPlus className="h-7 w-7" /> : <LogIn className="h-7 w-7" />}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">{authView === 'signup' ? 'Create Organization' : 'Sign in to GRIDFLOW'}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {authView === 'signup'
              ? 'Launch your organization dashboard in seconds.'
              : 'Use your GRIDFLOW credentials to access your organization telemetry.'}
          </p>
        </div>

        {authError && (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {authError}
          </div>
        )}

        <form onSubmit={authView === 'signup' ? handleSignup : handleLogin} className="space-y-4">
          {authView === 'signup' && (
            <label className="block text-sm text-slate-300">
              <span className="text-slate-400">Your name</span>
              <input
                value={authForm.name}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                placeholder="Jane Doe"
              />
            </label>
          )}

          <label className="block text-sm text-slate-300">
            <span className="text-slate-400">Email address</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              placeholder="jane@example.com"
            />
          </label>

          {authView === 'signup' && (
            <label className="block text-sm text-slate-300">
              <span className="text-slate-400">Organization name</span>
              <input
                value={authForm.organizationName}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, organizationName: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                placeholder="Example Inc."
              />
            </label>
          )}

          <label className="block text-sm text-slate-300">
            <span className="text-slate-400">Password</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {authView === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {authView === 'signup' ? (
            <button onClick={() => setAuthView('login')} className="font-semibold text-cyan-300 hover:text-cyan-200">
              Already have an account? Sign in
            </button>
          ) : (
            <button onClick={() => setAuthView('signup')} className="font-semibold text-cyan-300 hover:text-cyan-200">
              Create a new organization
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderStatus = () => {
    if (!metrics) return null;
    switch (metrics.status) {
      case 'critical':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold shadow-inner">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            System Critical
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold shadow-inner">
            <Shield className="w-4 h-4 text-amber-500 animate-pulse" />
            System Warning
          </div>
        );
      case 'healthy':
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            System Healthy
          </div>
        );
    }
  };

  if (!user && !isLoading) {
    return renderAuthForm();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
            <Activity className="absolute w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent uppercase">
              GRIDFLOW
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold tracking-wider">
              Initializing Telemetry Engine...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                GRIDFLOW
              </h1>
              {metrics && (
                <div className="ml-3 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Agent: <strong className="text-slate-200 font-bold">{metrics.agentId || 'Local Node'}</strong> ({metrics.hostname || 'localhost'})
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">Real-time System Performance Monitor</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {renderStatus()}
            
            {isConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute" />
                Live Tunnel Active
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Gateway Offline
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-400">
              {user?.organizationName || user?.email}
            </div>

            <button 
              onClick={fetchInitialData} 
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Manual Sync Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAgentForm((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
              title="Create new agent"
            >
              <UserPlus className="w-4 h-4" />
              {showAgentForm ? 'Cancel' : 'New Agent'}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </header>

        {showAgentForm && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">New agent</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Create a trusted agent</h2>
                <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                  Give your new agent a memorable name and GRIDFLOW will generate a secure key for onboarding.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleCreateAgent}
                  disabled={isCreatingAgent}
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingAgent ? 'Provisioning...' : 'Provision agent'}
                </button>
                <button
                  onClick={() => setShowAgentForm(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <span className="text-sm font-medium text-slate-300">Agent name</span>
                <input
                  value={agentForm.name}
                  onChange={(event) => setAgentForm({ name: event.target.value })}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="web-server-1"
                />
              </label>
            </div>
          </div>
        )}

        {createdAgent && (
          <div className="mb-6">
            <AgentOnboardingPanel
              agentName={createdAgent.name}
              agentKey={createdAgent.agentKey}
              backendUrl={createdAgent.backendUrl}
              onClose={() => setCreatedAgent(null)}
            />
          </div>
        )}

        {/* Sync API Error banner */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span><strong>API Connection Fault:</strong> {apiError}</span>
            </div>
            <button 
              onClick={fetchInitialData} 
              className="text-xs px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 transition-colors font-bold"
            >
              Force Retry Sync
            </button>
          </div>
        )}

        {/* Alert Banner System */}
        <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

        <main className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
            <AnalyticsPanel agents={agents} incidents={incidents} />
            <ActivityFeed events={activityFeed} />
          </div>

          <TopologyView agents={agents} incidents={incidents} />

          <section className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-2xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live metrics</p>
                <h2 className="text-2xl font-semibold text-slate-100">Operational telemetry</h2>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">
                View live health, resource usage, and trends across your organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="CPU Load"
                value={metrics ? metrics.cpu : '0.0'}
                unit="%"
                icon={<Cpu className="w-6 h-6 text-cyan-400" />}
                gradientClass="from-cyan-500 to-blue-500"
                showProgress={true}
                progressValue={metrics ? metrics.cpu : 0}
              />

              <MetricCard
                title="Memory Used"
                value={metrics ? metrics.memory : '0.0'}
                unit="%"
                icon={<Database className="w-6 h-6 text-violet-400" />}
                gradientClass="from-violet-500 to-purple-500"
                showProgress={true}
                progressValue={metrics ? metrics.memory : 0}
              />

              <MetricCard
                title="System Uptime"
                value={metrics ? metrics.uptime : '0.0'}
                unit="hours"
                icon={<Clock className="w-6 h-6 text-amber-400" />}
                gradientClass="from-amber-500 to-orange-500"
                footerText="Continuous operational telemetry"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <MetricsChart
                title="CPU Usage History"
                data={history}
                dataKey="cpu"
                color="#06b6d4"
                gradientId="cpuGrad"
                bulletColor="bg-cyan-400"
              />

              <MetricsChart
                title="Memory Usage History"
                data={history}
                dataKey="memory"
                color="#8b5cf6"
                gradientId="memGrad"
                bulletColor="bg-violet-400"
              />
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <IncidentPanel incidents={incidents} />
            <InfrastructurePanel agents={agents} />
          </div>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Notification settings</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Incident webhooks</h2>
                <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                  Configure Discord and Slack webhooks so critical incidents are delivered to your operations team.
                </p>
              </div>
              <button
                onClick={handleSaveNotificationSettings}
                disabled={isSavingSettings}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSettings ? 'Saving...' : 'Save webhooks'}
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="block rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <span className="text-sm font-medium text-slate-300">Discord webhook URL</span>
                <input
                  value={notificationSettings.discordWebhookUrl}
                  onChange={(event) => setNotificationSettings((prev) => ({ ...prev, discordWebhookUrl: event.target.value }))}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </label>

              <label className="block rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <span className="text-sm font-medium text-slate-300">Slack webhook URL</span>
                <input
                  value={notificationSettings.slackWebhookUrl}
                  onChange={(event) => setNotificationSettings((prev) => ({ ...prev, slackWebhookUrl: event.target.value }))}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </label>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-900 text-center text-xs text-slate-600 font-medium">
          GRIDFLOW telemetry client built with React, Vite, Tailwind CSS, Recharts, and Mongoose
        </footer>

      </div>
    </div>
  );
};

export default App;
