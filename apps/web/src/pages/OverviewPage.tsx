import React from 'react';
import { Cpu, Database, Clock, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { MetricsChart } from '../components/MetricsChart';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { ActivityFeed } from '../components/ActivityFeed';
import { AlertBanner } from '../components/AlertBanner';
import { Metrics, AlertData, IncidentData, AgentData, FeedEvent } from '../types';

interface OverviewPageProps {
  metrics: Metrics | null;
  history: Metrics[];
  alerts: AlertData[];
  incidents: IncidentData[];
  agents: AgentData[];
  activityFeed: FeedEvent[];
  onDismissAlert: (id: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  history,
  alerts,
  incidents,
  agents,
  activityFeed,
  onDismissAlert,
}) => {
  const statusBadge = () => {
    if (!metrics) return null;
    const cfg = {
      critical: { label: 'System Critical', icon: ShieldAlert, cls: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
      warning:  { label: 'System Warning',  icon: Shield,      cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
      healthy:  { label: 'System Healthy',  icon: ShieldCheck, cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    }[metrics.status] ?? { label: 'Healthy', icon: ShieldCheck, cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    const Icon = cfg.icon;
    return (
      <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}>
        <Icon className="h-3.5 w-3.5" />
        {cfg.label}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Status row */}
      {metrics && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">
              Last update: {metrics.formattedTime || '—'} · Agent: <span className="text-slate-300">{metrics.agentId || 'local'}</span>
            </p>
          </div>
          {statusBadge()}
        </div>
      )}

      <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

      {/* Analytics + Feed */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <AnalyticsPanel agents={agents} incidents={incidents} />
        <ActivityFeed events={activityFeed} />
      </div>

      {/* Live metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="CPU Load"
          value={metrics ? metrics.cpu : '—'}
          unit="%"
          icon={<Cpu className="h-4 w-4" />}
          gradientClass="from-cyan-500 to-blue-500"
          showProgress
          progressValue={metrics?.cpu ?? 0}
        />
        <MetricCard
          title="Memory Used"
          value={metrics ? metrics.memory : '—'}
          unit="%"
          icon={<Database className="h-4 w-4" />}
          gradientClass="from-violet-500 to-purple-500"
          showProgress
          progressValue={metrics?.memory ?? 0}
        />
        <MetricCard
          title="System Uptime"
          value={metrics ? metrics.uptime : '—'}
          unit="hrs"
          icon={<Clock className="h-4 w-4" />}
          gradientClass="from-amber-500 to-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MetricsChart
          title="CPU Usage"
          data={history}
          dataKey="cpu"
          color="#06b6d4"
          gradientId="cpuGrad"
          bulletColor="bg-cyan-400"
        />
        <MetricsChart
          title="Memory Usage"
          data={history}
          dataKey="memory"
          color="#8b5cf6"
          gradientId="memGrad"
          bulletColor="bg-violet-400"
        />
      </div>
    </div>
  );
};
