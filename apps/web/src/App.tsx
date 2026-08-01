import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Activity, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AgentOnboardingPanel } from './components/AgentOnboardingPanel';
import { TrialBanner } from './components/TrialBanner';
import { MarketingShell } from './components/layout/MarketingShell';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { PricingPage } from './pages/PricingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
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
    `input-light${err ? ' error' : ''}`;

  const labelCls = 'block text-[13px] font-medium mb-1.5';
  const errCls = 'mt-1 text-[12px]';

  return (
    <MarketingShell>
      <section style={{ padding: '92px 0 80px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 32, gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 22, justifyContent: 'start' }}>
              <div style={{ borderRadius: 24, padding: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="overline" style={{ margin: 0, marginBottom: 14, letterSpacing: '0.16em', color: 'var(--text-3)' }}>Authentication</p>
                <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.05, fontWeight: 800, color: 'var(--text)' }}>
                  {view === 'signup' ? 'Create your organization' : 'Sign in to your workspace'}
                </h1>
                <p style={{ marginTop: 18, color: 'var(--text-3)', fontSize: 15, lineHeight: 1.8 }}>
                  {view === 'signup' ? 'Free tier — no credit card required.' : 'Access your real-time operations console with centralized telemetry and alerts.'}
                </p>
              </div>
              <div style={{ borderRadius: 24, padding: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(56,189,248,0.12)', display: 'grid', placeItems: 'center' }}>
                    <Activity size={18} color='var(--accent)' />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{view === 'signup' ? 'New workspace' : 'Returning user'}</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>Enter your account credentials to continue.</p>
                  </div>
                </div>
                {error && (
                  <div style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.24)', borderRadius: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--crit)' }}>{error}</p>
                  </div>
                )}
                {success && (
                  <div style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.24)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--ok)' }} />
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ok)' }}>Authenticated — loading dashboard…</p>
                  </div>
                )}
                <form onSubmit={handle} style={{ display: 'grid', gap: 18 }} noValidate>
                  {view === 'signup' && (
                    <div>
                      <label className={labelCls} style={{ color: 'var(--text-3)' }}>Your name</label>
                      <input value={form.name} onChange={set('name')} onBlur={() => touch('name')} className={inputCls(nameErr)} placeholder="Jane Doe" />
                      {nameErr && <p className={errCls} style={{ color: 'var(--crit)' }}>{nameErr}</p>}
                    </div>
                  )}
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-3)' }}>Email address</label>
                    <input type="email" value={form.email} onChange={set('email')} onBlur={() => touch('email')} className={inputCls(emailErr)} placeholder="jane@example.com" />
                    {emailErr && <p className={errCls} style={{ color: 'var(--crit)' }}>{emailErr}</p>}
                  </div>
                  {view === 'signup' && (
                    <div>
                      <label className={labelCls} style={{ color: 'var(--text-3)' }}>Organization name</label>
                      <input value={form.organizationName} onChange={set('organizationName')} onBlur={() => touch('organizationName')} className={inputCls(orgErr)} placeholder="Acme Inc." />
                      {orgErr && <p className={errCls} style={{ color: 'var(--crit)' }}>{orgErr}</p>}
                    </div>
                  )}
                  <div>
                    <label className={labelCls} style={{ color: 'var(--text-3)' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} onBlur={() => touch('password')} className={inputCls(pwErr)} style={{ paddingRight: 44 }} placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {pwErr && <p className={errCls} style={{ color: 'var(--crit)' }}>{pwErr}</p>}
                    {view === 'signup' && form.password.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: strength.s >= i ? (strength.label === 'Weak' ? 'var(--crit)' : strength.label === 'Fair' ? 'var(--warn)' : 'var(--ok)') : 'rgba(255,255,255,0.06)', transition: 'background 0.2s' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{strength.label}</span>
                      </div>
                    )}
                  </div>
                  <Button type="submit" variant="blue" disabled={!canSubmit} style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 14 }}>
                  {loading ? 'Please wait…' : view === 'signup' ? 'Create free account' : 'Sign in'}
                </Button>
              </form>
                <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                  {view === 'signup' ? (
                    <>Already have an account?{' '}
                      <button onClick={() => switchView('login')} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 700, padding: 0 }}>Sign in</button>
                    </>
                  ) : (
                    <>New to GRIDFLOW?{' '}
                      <button onClick={() => switchView('signup')} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 700, padding: 0 }}>Create free account</button>
                    </>
                  )}
                </div>
                <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                  By continuing you agree to our <Link to="/terms" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
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
      <div style={{ minHeight: '100vh', background: 'var(--d-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 16px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.15)', borderTopColor: 'var(--accent-blue)', animation: 'spin 0.8s linear infinite' }} />
            <Activity size={16} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--accent-blue)' }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--d-text-2)', margin: '0 0 4px' }}>Initializing GRIDFLOW</p>
          <p style={{ fontSize: 12, color: 'var(--d-text-3)', margin: 0 }}>Connecting to telemetry gateway…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-scroll" style={{ display: 'flex', minHeight: '100vh', background: 'var(--d-bg)' }}>
      <Sidebar user={user} onLogout={onLogout} isConnected={isConnected} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 224 }}>
        <TopBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isConnected={isConnected}
          onRefresh={fetchInitialData}
          onNewAgent={() => setShowAgentForm(v => !v)}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {isFreePlan && window.location.pathname === '/dashboard' && (
            <TrialBanner agentCount={agents.length} incidentCount={incidents.length} />
          )}

          {showAgentForm && (
            <Card variant="dark" style={{ marginBottom: 20, padding: '20px 24px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--d-text)', margin: '0 0 4px' }}>Provision new agent</p>
              <p style={{ fontSize: 12, color: 'var(--d-text-3)', margin: '0 0 16px' }}>Assign a name and GRIDFLOW will generate a secure key for deployment.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input value={agentFormName} onChange={e => setAgentFormName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateAgent()}
                  style={{ flex: 1, minWidth: 220, borderRadius: 12, border: '1px solid var(--d-border)', background: 'var(--d-raised)', color: 'var(--d-text)', padding: '12px 14px', fontSize: 14 }} placeholder="e.g. prod-web-01" />
                <Button variant="blue" onClick={handleCreateAgent} disabled={isCreatingAgent || !agentFormName.trim()} style={{ whiteSpace: 'nowrap' }}>
                  {isCreatingAgent ? 'Provisioning…' : 'Provision'}
                </Button>
                <button onClick={() => setShowAgentForm(false)}
                  style={{ background: 'none', border: '1px solid var(--d-border)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--d-text-2)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </Card>
          )}

          {createdAgent && (
            <div style={{ marginBottom: 20 }}>
              <AgentOnboardingPanel agentName={createdAgent.name} agentKey={createdAgent.agentKey}
                backendUrl={createdAgent.backendUrl} onClose={() => setCreatedAgent(null)} />
            </div>
          )}

          {apiError && (
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 16px' }}>
              <p style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}><strong>Connection error:</strong> {apiError}</p>
              <button onClick={fetchInitialData} style={{ background: 'rgba(220,38,38,0.12)', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fca5a5', cursor: 'pointer' }}>Retry</button>
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
        <Route path="/privacy"      element={<PrivacyPage />} />
        <Route path="/terms"        element={<TermsPage />} />
        <Route path="/login"        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} />} />
        <Route path="/dashboard/*"  element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Root;
