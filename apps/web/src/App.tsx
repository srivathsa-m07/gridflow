import React, { useEffect, useState } from 'react';
import { Cpu, Database, Clock, Activity, ShieldCheck, ShieldAlert, Shield, RefreshCw, LogIn, UserPlus, LogOut } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { AlertBanner } from './components/AlertBanner';
import { MetricsChart } from './components/MetricsChart';
import { IncidentPanel } from './components/IncidentPanel';
import { InfrastructurePanel } from './components/InfrastructurePanel';
import { apiService } from './services/api';
import { socketService } from './services/socket';
import { Metrics, AlertData, IncidentData, AgentData } from './types';

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
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const USER_STORAGE_KEY = 'GRIDFLOW_USER_INFO';

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

  const fetchInitialData = async () => {
    try {
      setApiError(null);
      setIsLoading(true);

      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('API Gateway is currently unreachable');
      }

      const [historyData, incidentsData, agentsData] = await Promise.all([
        apiService.fetchHistory(),
        apiService.fetchIncidents(),
        apiService.fetchAgents()
      ]);

      const chronHistory = [...historyData].reverse().map((m) => ({
        ...m,
        formattedTime: m.timestamp
          ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : ''
      }));

      setHistory(chronHistory);
      setIncidents(incidentsData);
      setAgents(agentsData);

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
      setAgents(updatedAgents.filter((agent) => !agent.organizationId || agent.organizationId === user.organizationId));
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
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </header>

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

        {/* Stats Grid */}
        <main className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CPU Card */}
            <MetricCard
              title="CPU Load"
              value={metrics ? metrics.cpu : '0.0'}
              unit="%"
              icon={<Cpu className="w-6 h-6 text-cyan-400" />}
              gradientClass="from-cyan-500 to-blue-500"
              showProgress={true}
              progressValue={metrics ? metrics.cpu : 0}
            />

            {/* Memory Card */}
            <MetricCard
              title="Memory Used"
              value={metrics ? metrics.memory : '0.0'}
              unit="%"
              icon={<Database className="w-6 h-6 text-violet-400" />}
              gradientClass="from-violet-500 to-purple-500"
              showProgress={true}
              progressValue={metrics ? metrics.memory : 0}
            />

            {/* Uptime Card */}
            <MetricCard
              title="System Uptime"
              value={metrics ? metrics.uptime : '0.0'}
              unit="hours"
              icon={<Clock className="w-6 h-6 text-amber-400" />}
              gradientClass="from-amber-500 to-orange-500"
              footerText="Continuous operational telemetry"
            />

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CPU Chart */}
            <MetricsChart
              title="CPU Usage History"
              data={history}
              dataKey="cpu"
              color="#06b6d4"
              gradientId="cpuGrad"
              bulletColor="bg-cyan-400"
            />

            {/* Memory Chart */}
            <MetricsChart
              title="Memory Usage History"
              data={history}
              dataKey="memory"
              color="#8b5cf6"
              gradientId="memGrad"
              bulletColor="bg-violet-400"
            />

          </div>

          {/* Infrastructure Overview Panel */}
          <InfrastructurePanel agents={agents} />

          {/* Incident Intelligence Panel */}
          <IncidentPanel incidents={incidents} />

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
