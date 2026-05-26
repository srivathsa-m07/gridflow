import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AgentOnboardingPanel } from './components/AgentOnboardingPanel';
import { TrialBanner } from './components/TrialBanner';

import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { PricingPage } from './pages/PricingPage';
import { OverviewPage } from './pages/OverviewPage';
import { TopologyPage } from './pages/TopologyPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { NotificationsPage } from './pages/NotificationsPage';

import { apiService } from './services/api';
import { socketService } from './services/socket';
import { Metrics, AlertData, IncidentData, AgentData, FeedEvent } from './types';

type User = {
  name: string;
  email: string;
  organizationId: string;
  organizationName?: string;
  plan?: string;
};

// ── Validation helpers ────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const pwStrength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { s, label: 'Weak',   bar: 'bg-rose-500' };
  if (s <= 2) return { s, label: 'Fair',   bar: 'bg-amber-500' };
  if (s <= 3) return { s, label: 'Good',   bar: 'bg-yellow-400' };
  return       { s, label: 'Strong', bar: 'bg-emerald-500' };
};

// ── AuthPage ──────────────────────────────────────────────────────────────────
const AuthPage: React.FC<{ onAuth: (u: User) => void }> = ({ onAuth }) => {
  const [view, setView]     = useState<'login' | 'signup'>('login');
  const [form, setForm]     = useState({ name: '', email: '', password: '', organizationName: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }));
  const set   = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const emailErr = touched.email && form.email && !isValidEmail(form.email)
    ? 'Enter a valid email address' : null;
  const pwErr = touched.password && form.password.length > 0 && form.password.length < 8
    ? 'Password must be at least 8 characters' : null;
  const nameErr = touched.name && view === 'signup' && !form.name.trim()
    ? 'Name is required' : null;
  const orgErr = touched.organizationName && view === 'signup' && !form.organizationName.trim()
    ? 'Organization name is required' : null;

  const strength = pwStrength(form.password);

  const canSubmit = !loading && isValidEmail(form.email) && form.password.length >= 8 &&
    (view === 'login' || (form.name.trim() !== '' && form.organizationName.trim() !== ''));

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true, organizationName: true });
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const result = view === 'login'
        ? await apiService.login(form.email, form.password)
        : await apiService.signup(form.name, form.email, form.password, form.organizationName);
      setSuccess(true);
      setTimeout(() => onAuth({
        name: result.user?.name || '',
        email: result.user?.email || '',
        organizationId: result.user?.organizationId || '',
        organizationName: result.user?.organizationName,
        plan: result.user?.plan || 'free',
      }), 350);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (v: 'login' | 'signup') => {
    setView(v); setError(null); setTouched({}); setSuccess(false);
  };

  const inputCls = (err: string | null) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition placeholder:text-stone-300 ${
      err ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-stone-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50'
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfcfa] bg-dot p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-premium-lg">
        <div className="mb-6 text-center">
          <Link to="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
              <Activity className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-stone-900">GRIDFLOW</span>
          </Link>
          <h1 className="mt-2 text-xl font-bold text-stone-900">
            {view === 'signup' ? 'Create your organization' : 'Sign in to your workspace'}
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            {view === 'signup' ? 'Free tier — no credit card required.' : 'Access your real-time operations console.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
            <p className="text-xs text-rose-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-250 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs text-emerald-800">Authenticated — loading dashboard…</p>
          </div>
        )}

        <form onSubmit={handle} className="space-y-4" noValidate>
          {view === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Your name</label>
              <input value={form.name} onChange={set('name')} onBlur={() => touch('name')}
                className={inputCls(nameErr)} placeholder="Jane Doe" />
              {nameErr && <p className="mt-1 text-xs text-rose-500">{nameErr}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Email address</label>
            <input type="email" value={form.email} onChange={set('email')} onBlur={() => touch('email')}
              className={inputCls(emailErr)} placeholder="jane@example.com" />
            {emailErr && <p className="mt-1 text-xs text-rose-500">{emailErr}</p>}
          </div>

          {view === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-stone-500">Organization name</label>
              <input value={form.organizationName} onChange={set('organizationName')} onBlur={() => touch('organizationName')}
                className={inputCls(orgErr)} placeholder="Acme Inc." />
              {orgErr && <p className="mt-1 text-xs text-rose-500">{orgErr}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-500">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={set('password')} onBlur={() => touch('password')}
                className={inputCls(pwErr) + ' pr-10'} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwErr && <p className="mt-1 text-xs text-rose-500">{pwErr}</p>}
            {view === 'signup' && form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength.s >= i ? strength.bar : 'bg-stone-150'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-stone-400">{strength.label}</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={!canSubmit}
            className="w-full rounded-lg bg-indigo-650 py-2.5 text-sm font-semibold text-white hover:bg-indigo-755 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {loading ? 'Please wait…' : view === 'signup' ? 'Create free account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-500">
          {view === 'signup' ? (
            <>Already have an account?{' '}
              <button onClick={() => switchView('login')} className="font-semibold text-indigo-600 hover:text-indigo-750 cursor-pointer">Sign in</button>
            </>
          ) : (
            <>New to GRIDFLOW?{' '}
              <button onClick={() => switchView('signup')} className="font-semibold text-indigo-600 hover:text-indigo-750 cursor-pointer">Create free account</button>
            </>
          )}
        </p>
        <p className="mt-3 text-center text-[10px] text-stone-400">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isConnected, setIsConnected]   = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [metrics, setMetrics]           = useState<Metrics | null>(null);
  const [history, setHistory]           = useState<Metrics[]>([]);
  const [alerts, setAlerts]             = useState<AlertData[]>([]);
  const [incidents, setIncidents]       = useState<IncidentData[]>([]);
  const [agents, setAgents]             = useState<AgentData[]>([]);
  const [activityFeed, setActivityFeed] = useState<FeedEvent[]>([]);
  const [showAgentForm, setShowAgentForm]   = useState(false);
  const [agentFormName, setAgentFormName]   = useState('');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<{ name: string; agentKey: string; backendUrl: string } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({ discordWebhookUrl: '', slackWebhookUrl: '' });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const previousAgents  = useRef<Map<string, AgentData>>(new Map());
  const initialAgentLoad = useRef(true);
  const backendUrlDisplay = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const addFeedEvent = (event: FeedEvent) =>
    setActivityFeed(prev => [event, ...prev].slice(0, 12));

  const updateAgentRegistry = (nextAgents: AgentData[]) => {
    const existing = previousAgents.current;
    if (!initialAgentLoad.current) {
      nextAgents.forEach(agent => {
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
    previousAgents.current = new Map(nextAgents.map(a => [a.agentId, a]));
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
      const chronHistory = [...historyData].reverse().map(m => ({
        ...m,
        formattedTime: m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '',
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

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    const socket = socketService.connect();
    socket.on('connect',       () => { setIsConnected(true); setApiError(null); });
    socket.on('disconnect',    () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));
    socket.on('metrics_update', (newMetrics: Metrics) => {
      if (newMetrics.organizationId && newMetrics.organizationId !== user.organizationId) return;
      const formatted = { ...newMetrics, formattedTime: newMetrics.timestamp ? new Date(newMetrics.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '' };
      setMetrics(formatted);
      setHistory(prev => { const u = [...prev, formatted]; return u.length > 20 ? u.slice(1) : u; });
    });
    socket.on('agent_registry_update', (updatedAgents: AgentData[]) => {
      // Backend already sends only this org's agents — no client-side filter needed
      updateAgentRegistry(updatedAgents);
    });
    socket.on('alert', (payload: { type: 'HIGH_CPU'; message: string; organizationId?: string }) => {
      if (payload.organizationId && payload.organizationId !== user.organizationId) return;
      setAlerts(prev => prev.some(a => a.type === payload.type) ? prev : [...prev, { id: `${Date.now()}-${Math.random()}`, type: payload.type, message: payload.message, timestamp: new Date() }]);
    });
    socket.on('incident', (inc: IncidentData) => {
      if ((inc as any).organizationId && (inc as any).organizationId !== user.organizationId) return;
      setIncidents(prev => prev.some(i => i.incidentId === inc.incidentId) ? prev : [inc, ...prev]);
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
    '/dashboard':              { title: 'Overview',       subtitle: 'Real-time operational telemetry' },
    '/dashboard/topology':     { title: 'Topology',       subtitle: 'Infrastructure map and agent status' },
    '/dashboard/incidents':    { title: 'Incidents',      subtitle: 'AI-powered incident intelligence' },
    '/dashboard/notifications':{ title: 'Notifications',  subtitle: 'Webhook configuration' },
  };
  const pageInfo = PAGE_TITLES[window.location.pathname] || PAGE_TITLES['/dashboard'];
  const isFreePlan = !user.plan || user.plan === 'free';

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
          onNewAgent={() => setShowAgentForm(v => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Trial banner — overview only */}
          {isFreePlan && window.location.pathname === '/dashboard' && (
            <TrialBanner agentCount={agents.length} incidentCount={incidents.length} />
          )}

          {/* Agent creation form */}
          {showAgentForm && (
            <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="mb-1 text-sm font-semibold text-slate-200">Provision new agent</h3>
              <p className="mb-4 text-xs text-slate-500">Assign a name and GRIDFLOW will generate a secure key for deployment.</p>
              <div className="flex items-center gap-3">
                <input value={agentFormName} onChange={e => setAgentFormName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateAgent()}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 placeholder:text-slate-600"
                  placeholder="e.g. prod-web-01" />
                <button onClick={handleCreateAgent} disabled={isCreatingAgent || !agentFormName.trim()}
                  className="rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCreatingAgent ? 'Provisioning…' : 'Provision'}
                </button>
                <button onClick={() => setShowAgentForm(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {createdAgent && (
            <div className="mb-5">
              <AgentOnboardingPanel agentName={createdAgent.name} agentKey={createdAgent.agentKey}
                backendUrl={createdAgent.backendUrl} onClose={() => setCreatedAgent(null)} />
            </div>
          )}

          {apiError && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <p className="text-xs text-rose-300"><span className="font-semibold">Connection error:</span> {apiError}</p>
              <button onClick={fetchInitialData} className="ml-4 rounded-md bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors">
                Retry
              </button>
            </div>
          )}

          <Routes>
            <Route path="/" element={
              <OverviewPage metrics={metrics} history={history} alerts={alerts}
                incidents={incidents} agents={agents} activityFeed={activityFeed}
                onDismissAlert={id => setAlerts(prev => prev.filter(a => a.id !== id))}
                onNewAgent={() => setShowAgentForm(v => !v)} />
            } />
            <Route path="/topology"      element={<TopologyPage agents={agents} incidents={incidents} />} />
            <Route path="/incidents"     element={<IncidentsPage incidents={incidents} />} />
            <Route path="/notifications" element={
              <NotificationsPage settings={notificationSettings} onChange={setNotificationSettings}
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
                isSaving={isSavingSettings} />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
const USER_KEY = 'GRIDFLOW_USER_INFO';

const Root: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });

  const handleAuth = (u: User) => { localStorage.setItem(USER_KEY, JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { apiService.logout(); localStorage.removeItem(USER_KEY); setUser(null); };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<LandingPage />} />
        <Route path="/features"     element={<FeaturesPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/docs"         element={<DocsPage />} />
        <Route path="/pricing"      element={<PricingPage />} />
        <Route path="/login"        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} />} />
        <Route path="/dashboard/*"  element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
