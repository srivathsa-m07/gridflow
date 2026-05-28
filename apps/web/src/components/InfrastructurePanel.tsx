import React from 'react';
import { Server, CheckCircle, WifiOff, Clock } from 'lucide-react';
import { AgentData } from '../types';

interface InfrastructurePanelProps {
  agents: AgentData[];
}

export const InfrastructurePanel: React.FC<InfrastructurePanelProps> = ({ agents }) => {
  const online = agents.filter((a) => a.isOnline).length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20 animate-fadeIn">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-100">Infrastructure Overview</h2>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          <span className="text-slate-200 font-bold">{online}</span>/{agents.length} online
        </span>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-800/50">
            <Server className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-sm font-bold text-stone-850">No agents registered</p>
          <p className="mt-1 text-xs text-slate-500">Create an agent to start monitoring</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                agent.isOnline
                  ? 'border-slate-800/80 bg-slate-800/15 hover:border-stone-300 shadow-sm'
                  : 'border-rose-100 bg-rose-50/20'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.isOnline ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                {agent.isOnline ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-rose-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-200">{agent.agentId}</p>
                <p className="truncate text-[10px] text-slate-400 font-medium">{agent.hostname}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">CPU</p>
                  <p className={`text-xs font-bold ${agent.cpu > 80 ? 'text-rose-600' : agent.cpu > 50 ? 'text-amber-600' : 'text-slate-300'}`}>
                    {agent.cpu}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">MEM</p>
                  <p className={`text-xs font-bold ${agent.memory > 80 ? 'text-rose-600' : agent.memory > 50 ? 'text-amber-600' : 'text-slate-300'}`}>
                    {agent.memory}%
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-stone-450 font-semibold">
                  <Clock className="h-3 w-3" />
                  {new Date(agent.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
