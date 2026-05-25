import React from 'react';
import { Cpu, Database, Clock, ShieldCheck, ShieldAlert, Shield, Server, ArrowRight } from 'lucide-react';
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
  onNewAgent?: () => void;
}

const ONBOARDING_STEPS = [
  { n: '01', title: 'Provision an agent', desc: 'Click "New Agent" in the top bar, give it a name, and copy the generated key.' },
  { n: '02', title: 'Deploy via Docker', desc: 'Run the generated docker command on any server. No Node.js required.' },
  { n: '03', title: 'Watch it connect', desc: 'Your agent appears here within seconds and begins streaming telemetry.' },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  history,
  alerts,
  incidents,
  agents,
  activityFeed,
  onDismissAlert,
  onNewAgent,
}) => {
  const hasAgents = agents.length > 0;

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

  // Empty state for new organizations with no agents
  if (!hasAgents && !metrics) {
    return (
      <div className="space-y-5">
        <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-slate-700">
            <Server className="h-6 w-6 text-slate-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-200">No agents connected</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
            Create your first monitoring agent to begin infrastructure telemetry collection.
          </p>
          {onNewAgent && (
            <button
              onClick={onNewAgent}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              Provision your first agent
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ONBOARDING_STEPS.map(({ n, title, desc }) => (
            <div key={n} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <span className="mb-3 block font-mono text-xl font-bold text-slate-700">{n}</span>
              <p className="mb-1 text-sm font-semibold text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {metrics && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Last update: {metrics.formattedTime || '—'} · Agent: <span className="text-slate-300">{metrics.agentId || 'local'}</span>
          </p>
          {statusBadge()}
        </div>
      )}

      <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <AnalyticsPanel agents={agents} incidents={incidents} />
        <ActivityFeed events={activityFeed} />
      </div>

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
