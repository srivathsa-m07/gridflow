import React from 'react';
import { MetricCard } from './MetricCard';
import { AgentData, IncidentData } from '../types';

interface AnalyticsPanelProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ agents, incidents }) => {
  const activeAgents = agents.filter((agent) => agent.isOnline).length;
  const healthyAgents = agents.filter((agent) => agent.status === 'healthy').length;
  const warningAgents = agents.filter((agent) => agent.status === 'warning').length;
  const criticalAgents = agents.filter((agent) => agent.status === 'critical').length;
  const averageCpu = agents.length ? Math.round(agents.reduce((sum, agent) => sum + agent.cpu, 0) / agents.length) : 0;
  const averageMemory = agents.length ? Math.round(agents.reduce((sum, agent) => sum + agent.memory, 0) / agents.length) : 0;

  return (
    <section className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Infrastructure overview</p>
          <h2 className="text-2xl font-semibold text-slate-100">Operational analytics</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Key observability signals for your organization, updated in real time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          title="Active agents"
          value={activeAgents}
          unit="online"
          icon={<span className="text-cyan-400 font-bold">•</span>}
          gradientClass="from-cyan-500 to-blue-500"
        />

        <MetricCard
          title="Healthy agents"
          value={healthyAgents}
          unit="online"
          icon={<span className="text-emerald-400 font-bold">•</span>}
          gradientClass="from-emerald-500 to-lime-500"
        />

        <MetricCard
          title="Warning agents"
          value={warningAgents}
          unit="online"
          icon={<span className="text-amber-400 font-bold">•</span>}
          gradientClass="from-amber-500 to-yellow-500"
        />

        <MetricCard
          title="Critical agents"
          value={criticalAgents}
          unit="active"
          icon={<span className="text-rose-400 font-bold">•</span>}
          gradientClass="from-rose-500 to-orange-500"
        />

        <MetricCard
          title="Active incidents"
          value={incidents.length}
          unit="open"
          icon={<span className="text-slate-100 font-bold">•</span>}
          gradientClass="from-slate-500 to-slate-700"
        />

        <MetricCard
          title="Avg CPU"
          value={averageCpu}
          unit="%"
          icon={<span className="text-cyan-400 font-bold">•</span>}
          gradientClass="from-cyan-500 to-sky-500"
        />

        <MetricCard
          title="Avg memory"
          value={averageMemory}
          unit="%"
          icon={<span className="text-violet-400 font-bold">•</span>}
          gradientClass="from-violet-500 to-fuchsia-500"
        />
      </div>
    </section>
  );
};
