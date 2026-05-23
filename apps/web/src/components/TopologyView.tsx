import React from 'react';
import { Server, WifiOff, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { AgentData, IncidentData } from '../types';

interface TopologyViewProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({ agents, incidents }) => {
  const incidentMap = new Map(incidents.map((inc) => [inc.agentId, true]));
  const online = agents.filter((a) => a.isOnline).length;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Infrastructure Topology</h2>
          <p className="mt-0.5 text-xs text-slate-500">Live agent map — {online}/{agents.length} nodes online</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
          <Activity className="h-3 w-3 text-cyan-400" />
          Real-time
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Server className="h-5 w-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">No agents connected</p>
          <p className="mt-1 text-xs text-slate-600">Create your first agent to populate the topology map</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => {
            const hasIncident = incidentMap.has(agent.agentId);
            return (
              <div
                key={agent.agentId}
                className={`rounded-lg border p-4 transition-colors ${
                  hasIncident
                    ? 'border-rose-900/40 bg-rose-950/10'
                    : agent.isOnline
                    ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    : 'border-slate-800/50 bg-slate-950/20 opacity-60'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${agent.isOnline ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                      {agent.isOnline ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <WifiOff className="h-3.5 w-3.5 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-200">{agent.agentId}</p>
                      <p className="truncate text-[10px] text-slate-500">{agent.hostname}</p>
                    </div>
                  </div>
                  {hasIncident && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-slate-900 px-2.5 py-2">
                    <p className="text-[10px] text-slate-600 mb-0.5">CPU</p>
                    <p className={`text-sm font-bold ${agent.cpu > 80 ? 'text-rose-400' : agent.cpu > 50 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {agent.cpu}%
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-900 px-2.5 py-2">
                    <p className="text-[10px] text-slate-600 mb-0.5">Memory</p>
                    <p className={`text-sm font-bold ${agent.memory > 80 ? 'text-rose-400' : agent.memory > 50 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {agent.memory}%
                    </p>
                  </div>
                </div>

                <p className="mt-2.5 text-[10px] text-slate-600">
                  Last seen {new Date(agent.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
