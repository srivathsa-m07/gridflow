import React from 'react';
import { Activity, Server, AlertOctagon, Cpu } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AgentData, IncidentData } from '../types';

interface AnalyticsPanelProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ agents, incidents }) => {
  const activeAgents = agents.filter((a) => a.isOnline).length;
  const healthyAgents = agents.filter((a) => a.status === 'healthy').length;
  const criticalAgents = agents.filter((a) => a.status === 'critical').length;
  const avgCpu = agents.length ? Math.round(agents.reduce((s, a) => s + a.cpu, 0) / agents.length) : 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Operational Analytics</h2>
        </div>
        <span className="text-xs text-slate-500">{agents.length} agents registered</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Online"
          value={activeAgents}
          unit="agents"
          icon={<Server className="h-4 w-4" />}
          gradientClass="from-cyan-500 to-blue-500"
        />
        <MetricCard
          title="Healthy"
          value={healthyAgents}
          unit="agents"
          icon={<Server className="h-4 w-4" />}
          gradientClass="from-emerald-500 to-teal-500"
        />
        <MetricCard
          title="Critical"
          value={criticalAgents}
          unit="agents"
          icon={<Server className="h-4 w-4" />}
          gradientClass="from-rose-500 to-orange-500"
        />
        <MetricCard
          title="Incidents"
          value={incidents.length}
          unit="open"
          icon={<AlertOctagon className="h-4 w-4" />}
          gradientClass="from-rose-500 to-pink-500"
        />
        <MetricCard
          title="Avg CPU"
          value={avgCpu}
          unit="%"
          icon={<Cpu className="h-4 w-4" />}
          gradientClass="from-cyan-500 to-sky-500"
          showProgress
          progressValue={avgCpu}
        />
      </div>
    </section>
  );
};
