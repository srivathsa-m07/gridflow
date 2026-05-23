import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Activity, LogIn, UserPlus } from 'lucide-react';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AgentOnboardingPanel } from './components/AgentOnboardingPanel';

import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { OverviewPage } from './pages/OverviewPage';
import { TopologyPage } from './pages/TopologyPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { NotificationsPage } from './pages/NotificationsPage';

import { apiService } from './services/api';
import { socketService } from './services/socket';
import { Metrics, AlertData, IncidentData, AgentData, FeedEvent } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────
type User = { name: string; email: string; organizationId: string; organizationName?: string };

// ─── Auth form ────────────────────────────────────────────────────────────────
const AuthPage: React.FC<{
  onAuth: (user: User) => void;
}> = ({ onAuth }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = view === 'login'
        ? await apiService.login(form.email, form.password)
        : await apiService.signup(form.name, form.email, form.password, form.organizationName);
      onAuth({
        name: result.user?.name || '',
        email: result.user?.email || '',
        organizationId: result.user?.organizationId || '',
        organizationName: result.user?.organizationName,
      });
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 placeholder:text-slate-600"
        placeholder={placeholder}
      />
    </label>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] bg-grid p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/30">
            {view === 'signup' ? <UserPlus className="h-6 w-6 text-cyan-400" /> : <LogIn className="h-6 w-6 text-cyan-400" />}
          </div>
          <div className="mb-1 flex items-center justify-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-300">GRIDFLOW</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            {view === 'signup' ? 'Create your organization' : 'Sign in to your workspace'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {view === 'signup' ? 'Start monitoring your infrastructure in minutes.' : 'Access your real-time operations console.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handle} className="space-y-4">
          {view === 'signup' && field('Your name', 'name', 'text', 'Jane Doe')}
          {field('Email address', 'email', 'email', 'jane@example.com')}
          {view === 'signup' && field('Organization name', 'organizationName', 'text', 'Acme Inc.')}
          {field('Password', 'password', 'password', '••••••••')}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : view === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          {view === 'signup' ? (
            <>Already have an account?{' '}
              <button onClick={() => setView('login')} className="font-semibold text-cyan-400 hover:text-cyan-300">Sign in</button>
            </>
          ) : (
            <>New to GRIDFLOW?{' '}
              <button onClick={() => setView('signup')} className="font-semibold text-cyan-400 hover:text-cyan-300">Create organization</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// ─── Dashboard shell ──────────────────────────────────────────────────────────
const Dashboard: React.FC<{
  user: User;
  onLogout: () => void;
}> = ({ user, onLogout }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<Metrics[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [activityFeed, setActivityFeed] = useState<FeedEvent[]>([]);

  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentFormName, setAgentFormName] = useState('');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<{ name: string; agentKey: string; backendUrl: string } | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({ discordWebhookUrl: '', slackWebhookUrl: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const previousAgents = useRef<Map<string, AgentData>>(new Map());
  const initialAgentLoad = useRef(true);

  const backendUrl = import.meta.env.VITE_API_URL || '';
  const backendUrlDisplay = backendUrl || 'http://localhost:3001';

  const addFeedEvent = (event: FeedEvent) => {
    setActivityFeed((prev) => [event, ...prev].slice(0, 12));
  };

  const updateAgentRegistry = (nextAgents: AgentData[]) => {
    const existing = previousAgents.current;
    if (!initialAgentLoad.current) {
      nextAgents.forEach((agent) => {
        const prev = existing.get(agent.agentId);
        if (!prev) {
          addFeedEvent({ id: `feed-${Date.now()}-${agent.agentId}`, type: 'agent_provisioned', message: `New agent provisioned: ${agent.agentId} (${agent.hostname})`, timestamp: new Date().toISOString(), severity: 'info' });
        } else if (!prev.isOnline && agent.isOnline) {
          addFeedEvent({ id: `feed-${Date.now()}-${agent.agentId}`, type: 'agent_connected', message: `Agent back online: ${agent.agentId} (${agent.hostname})`, timestamp: new Date().toISOString(), severity: 'info' });
        } else if (prev.isOnline && !agent.isOnline) {
          addFeedEvent({ id: `feed-${Date.now()}-${agent.agentId}`, type: 'agent_offline', message: `Agent offline: ${agent.agentId} (${agent.hostname})`, timestamp: new Date().toISOString(), severity: 'warning' });
        }
      });
    }
    previousAgents.current = new Map(nextAgents.map((a) => [a.agentId, a]));
    initialAgentLoad.current = false;
    setAgents(nextAgents);
  };

  const fetchInitialData = async () => {
    try {
      setApiError(null);
      setIsLoading(true);
      const healthy = await apiService.checkHealth();
      if (!healthy) throw new Error('API Gateway is currently unreachable');

      const [historyData, incidentsData, agentsData, notifications] = await Promise.all([
        apiService.fetchHistory(),
        apiService.fetchIncidents(),
        apiService.fetchAgents(),
        apiService.fetchNotificationSettings(),
      ]);

      const chronHistory = [...historyData].reverse().map((m) => ({
        ...m,
        formattedTime: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
      }));

      setHistory(chronHistory);
      setIncidents(incidentsData);
      updateAgentRegistry(agentsData);
      setNotificationSettings({ discordWebhookUrl: notifications?.discordWebhookUrl || '', slackWebhookUrl: notifications?.slackWebhookUrl || '' });
      if (chronHistory.length > 0) setMetrics(chronHistory[chronHistory.length - 1]);
      setIsConnected(true);
    } catch (err: any) {
      if (err?.status === 401) { onLogout(); return; }
      setApiError(err?.message || 'Failed to sync telemetry');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => { setIsConnected(true); setApiError(null); });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('metrics_update', (newMetrics: Metrics) => {
      if (newMetrics.organizationId && newMetrics.organizationId !== user.organizationId) return;
      const formatted = { ...newMetrics, formattedTime: newMetrics.timestamp ? new Date(newMetrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '' };
      setMetrics(formatted);
      setHistory((prev) => { const updated = [...prev, formatted]; return updated.length > 20 ? updated.slice(1) : updated; });
    });

    socket.on('agent_registry_update', (updatedAgents: AgentData[]) => {
      const filtered = updatedAgents.filter((a) => !a.organizationId || a.organizationId === user.organizationId);
      updateAgentRegistry(filtered);
    });

    socket.on('alert', (payload: { type: 'HIGH_CPU'; message: string; organizationId?: string }) => {
      if (payload.organizationId && payload.organizationId !== user.organizationId) return;
      setAlerts((prev) => {
        if (prev.some((a) => a.type === payload.type)) return prev;
        return [...prev, { id: `${Date.now()}-${Math.random()}`, type: payload.type, message: payload.message, timestamp: new Date() }];
      });
    });

    socket.on('incident', (inc: IncidentData) => {
      if ((inc as any).organizationId && (inc as any).organizationId !== user.organizationId) return;
      setIncidents((prev) => prev.some((i) => i.incidentId === inc.incidentId) ? prev : [inc, ...prev]);
      addFeedEvent({ id: `feed-${inc.incidentId}`, type: 'incident_triggered', message: `Incident on ${inc.agentId}: ${inc.message}`, timestamp: new Date().toISOString(), severity: inc.severity });
    });

    return () => { socket.disconnect(); };
  }, [user]);

  const handleCreateAgent = async () => {
    if (!agentFormName.trim()) return;
    setIsCreatingAgent(true);
    try {
      const result = await apiService.createAgent(agentFormName.trim());
      if (!result?.agentKey) throw new Error('Agent key not returned');
      setCreatedAgent({ name: agentFormName.trim(), agentKey: result.agentKey, backendUrl: backendUrlDisplay });
      setAgentFormName('');
      setShowAgentForm(false);
      await fetchInitialData();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to create agent');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Overview', subtitle: 'Real-time operational telemetry' },
    '/dashboard/topology': { title: 'Topology', subtitle: 'Infrastructure map and agent status' },
    '/dashboard/incidents': { title: 'Incidents', subtitle: 'AI-powered incident intelligence' },
    '/dashboard/notifications': { title: 'Notifications', subtitle: 'Webhook configuration' },
  };

  const currentPath = window.location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || PAGE_TITLES['/dashboard'];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Initializing GRIDFLOW</p>
            <p className="mt-1 text-xs text-slate-600">Connecting to telemetry gateway…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1a]">
      <Sidebar user={user} onLogout={onLogout} isConnected={isConnected} />

      <div className="flex flex-1 flex-col pl-60">
        <TopBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isConnected={isConnected}
          onRefresh={fetchInitialData}
          onNewAgent={() => setShowAgentForm((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Agent creation form */}
          {showAgentForm && (
            <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="mb-1 text-sm font-semibold text-slate-200">Provision new agent</h3>
              <p className="mb-4 text-xs text-slate-500">Assign a name and GRIDFLOW will generate a secure key for deployment.</p>
              <div className="flex items-center gap-3">
                <input
                  value={agentFormName}
                  onChange={(e) => setAgentFormName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAgent()}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 placeholder:text-slate-600"
                  placeholder="e.g. prod-web-01"
                />
                <button
                  onClick={handleCreateAgent}
                  disabled={isCreatingAgent || !agentFormName.trim()}
                  className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingAgent ? 'Provisioning…' : 'Provision'}
                </button>
                <button
                  onClick={() => setShowAgentForm(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Onboarding panel */}
          {createdAgent && (
            <div className="mb-5">
              <AgentOnboardingPanel
                agentName={createdAgent.name}
                agentKey={createdAgent.agentKey}
                backendUrl={createdAgent.backendUrl}
                onClose={() => setCreatedAgent(null)}
              />
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/8 px-4 py-3">
              <p className="text-xs text-rose-300"><span className="font-semibold">Connection error:</span> {apiError}</p>
              <button onClick={fetchInitialData} className="ml-4 rounded-md bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors">
                Retry
              </button>
            </div>
          )}

          {/* Routed pages */}
          <Routes>
            <Route path="/" element={
              <OverviewPage
                metrics={metrics}
                history={history}
                alerts={alerts}
                incidents={incidents}
                agents={agents}
                activityFeed={activityFeed}
                onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
              />
            } />
            <Route path="/topology" element={<TopologyPage agents={agents} incidents={incidents} />} />
            <Route path="/incidents" element={<IncidentsPage incidents={incidents} />} />
            <Route path="/notifications" element={
              <NotificationsPage
                settings={notificationSettings}
                onChange={setNotificationSettings}
                onSave={async () => {
                  setIsSavingSettings(true);
                  try {
                    const saved = await apiService.saveNotificationSettings(notificationSettings);
                    setNotificationSettings({ discordWebhookUrl: saved?.discordWebhookUrl || '', slackWebhookUrl: saved?.slackWebhookUrl || '' });
                  } catch (err: any) {
                    setApiError(err?.message || 'Failed to save settings');
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                isSaving={isSavingSettings}
              />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ─── Root with router ─────────────────────────────────────────────────────────
const USER_KEY = 'GRIDFLOW_USER_INFO';

const Root: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });

  const handleAuth = (u: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} />} />
        <Route
          path="/dashboard/*"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
