import React from 'react';
import { Server, CheckCircle, WifiOff, Clock } from 'lucide-react';
import { AgentData } from '../types';

interface InfrastructurePanelProps {
  agents: AgentData[];
}

export const InfrastructurePanel: React.FC<InfrastructurePanelProps> = ({ agents }) => {
  const online = agents.filter((a) => a.isOnline).length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Infrastructure</h2>
        </div>
        <span className="text-xs text-slate-500">
          <span className="font-semibold text-slate-300">{online}</span>/{agents.length} online
        </span>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-slate-700">
            <Server className="h-5 w-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">No agents registered</p>
          <p className="mt-1 text-xs text-slate-600">Create an agent to start monitoring</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                agent.isOnline
                  ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  : 'border-rose-900/20 bg-rose-950/10'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.isOnline ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                {agent.isOnline ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-slate-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">{agent.agentId}</p>
                <p className="truncate text-[10px] text-slate-500">{agent.hostname}</p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-[10px] text-slate-600">CPU</p>
                  <p className={`text-xs font-semibold ${agent.cpu > 80 ? 'text-rose-400' : agent.cpu > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {agent.cpu}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">MEM</p>
                  <p className={`text-xs font-semibold ${agent.memory > 80 ? 'text-rose-400' : agent.memory > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {agent.memory}%
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
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
