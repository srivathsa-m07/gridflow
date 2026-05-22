import React from 'react';
import { Server, WifiOff, CheckCircle2, Activity } from 'lucide-react';
import { AgentData, IncidentData } from '../types';

interface TopologyViewProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({ agents, incidents }) => {
  const incidentMap = new Map(incidents.map((inc) => [inc.agentId, true]));

  return (
    <section className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Topology</p>
          <h2 className="text-2xl font-semibold text-slate-100">Infrastructure map</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Visualize your connected agents, health status, and active incident surface.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs text-slate-300 border border-slate-800">
          <Activity className="w-4 h-4 text-cyan-400" />
          Realtime topology
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">No agents found yet.</p>
          <p className="mt-2 text-xs text-slate-400">Create your first agent to populate the infrastructure map.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex flex-col items-center text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 border border-slate-800 text-cyan-400">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Organization</p>
              <h3 className="text-lg font-semibold text-slate-100">GRIDFLOW Core</h3>
            </div>
            <p className="text-sm text-slate-500">Connected agents display below with live status.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map((agent) => {
              const hasIncident = incidentMap.has(agent.agentId);
              const statusLabel = agent.isOnline ? 'Online' : 'Offline';
              return (
                <div key={agent.agentId} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-inner">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`rounded-full p-2 bg-slate-950 border border-slate-800 ${agent.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {agent.isOnline ? <CheckCircle2 className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">{agent.agentId}</h3>
                          <p className="text-xs text-slate-500">{agent.hostname}</p>
                        </div>
                      </div>
                              <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full border ${agent.isOnline ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/15' : 'bg-rose-500/10 text-rose-300 border-rose-500/15'}`}>
                          {statusLabel}
                        </span>
                        {hasIncident && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            Incident active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">CPU</span>
                      <span className="text-sm font-semibold text-slate-100">{agent.cpu}%</span>
                      <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Memory</span>
                      <span className="text-sm font-semibold text-slate-100">{agent.memory}%</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-950/80 p-3 border border-slate-800 text-xs text-slate-400">
                    <p>Last seen {new Date(agent.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
