import React, { useEffect, useState } from 'react';
import { Cpu, Database, Clock, Activity, ShieldCheck, ShieldAlert, Shield, RefreshCw } from 'lucide-react';
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

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<Metrics[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);

  const fetchInitialData = async () => {
    try {
      setApiError(null);
      
      const isHealthy = await apiService.checkHealth();
      if (!isHealthy) {
        throw new Error('API Gateway is currently unreachable');
      }

      const [historyData, incidentsData, agentsData] = await Promise.all([
        apiService.fetchHistory(),
        apiService.fetchIncidents(),
        apiService.fetchAgents()
      ]);

      const chronHistory = [...historyData].reverse().map(m => ({
        ...m,
        formattedTime: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''
      }));

      setHistory(chronHistory);
      setIncidents(incidentsData);
      setAgents(agentsData);
      
      if (chronHistory.length > 0) {
        setMetrics(chronHistory[chronHistory.length - 1]);
      }
      
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to boot GRIDFLOW console:', err);
      setApiError(err?.message || 'Failed to sync operational telemetry');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInitialData();

    // Socket Connection Layer
    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      setApiError(null);
      console.log('Telemetry Socket.IO tunnel opened successfully');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      loggerWarn('Telemetry Socket.IO tunnel closed unexpectedly');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('metrics_update', (newMetrics: Metrics) => {
      const formatted = {
        ...newMetrics,
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
      setAgents(updatedAgents);
    });

    socket.on('alert', (alertPayload: { type: 'HIGH_CPU'; message: string }) => {
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
  }, []);

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

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

            <button 
              onClick={fetchInitialData} 
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Manual Sync Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
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

function loggerWarn(msg: string) {
  console.warn(msg);
}
