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
    <div className="rounded-xl border border-stone-205 bg-slate-900 p-5 shadow-lg shadow-black/20 animate-fadeIn">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800/50 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Infrastructure Topology</h2>
          <p className="mt-0.5 text-xs text-slate-400 font-semibold">Live agent network map — {online}/{agents.length} nodes active</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-800 px-3 py-1 text-xs text-slate-400 font-semibold">
          <Activity className="h-3 w-3 text-indigo-650 animate-pulse" />
          Real-time stream
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 py-12 text-center bg-slate-800/20">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-800">
            <Server className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-sm font-bold text-stone-850">No agents connected</p>
          <p className="mt-1 text-xs text-slate-500">Create your first agent to populate the topology map</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => {
            const hasIncident = incidentMap.has(agent.agentId);
            return (
              <div
                key={agent.agentId}
                className={`rounded-lg border p-4 transition-all ${
                  hasIncident
                    ? 'border-rose-250 bg-rose-50/30'
                    : agent.isOnline
                    ? 'border-slate-800 bg-slate-800/20 hover:border-stone-300 hover:shadow-sm'
                    : 'border-slate-800/60 bg-slate-800/30 opacity-60'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${agent.isOnline ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-800 border border-slate-800'}`}>
                      {agent.isOnline ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <WifiOff className="h-3.5 w-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-200">{agent.agentId}</p>
                      <p className="truncate text-[10px] text-slate-400 font-semibold">{agent.hostname}</p>
                    </div>
                  </div>
                  {hasIncident && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-slate-900 border border-slate-800/80 px-2.5 py-2 shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">CPU</p>
                    <p className={`text-sm font-bold ${agent.cpu > 80 ? 'text-rose-600' : agent.cpu > 50 ? 'text-amber-600' : 'text-slate-300'}`}>
                      {agent.cpu}%
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-900 border border-slate-800/80 px-2.5 py-2 shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold mb-0.5">Memory</p>
                    <p className={`text-sm font-bold ${agent.memory > 80 ? 'text-rose-600' : agent.memory > 50 ? 'text-amber-600' : 'text-slate-300'}`}>
                      {agent.memory}%
                    </p>
                  </div>
                </div>

                <p className="mt-2.5 text-[10px] text-stone-450 font-semibold">
                  Active {new Date(agent.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
