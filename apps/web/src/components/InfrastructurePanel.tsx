import React from 'react';
import { Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AgentData } from '../types';

interface InfrastructurePanelProps {
  agents: AgentData[];
}

export const InfrastructurePanel: React.FC<InfrastructurePanelProps> = ({ agents }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/85 rounded-2xl p-6 shadow-2xl mt-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Server className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-slate-200">Infrastructure Overview</h2>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          {agents.filter(a => a.isOnline).length} / {agents.length} Online
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm font-medium">
          No agents registered in the infrastructure.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className={`p-4 rounded-xl border transition-all duration-300 shadow-md flex flex-col gap-3 ${
                agent.isOnline
                  ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-rose-900/30 hover:border-rose-900/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Server className={`w-5 h-5 ${agent.isOnline ? 'text-cyan-400' : 'text-slate-600'}`} />
                    {agent.isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950"></span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${agent.isOnline ? 'text-slate-200' : 'text-slate-400'}`}>
                      {agent.agentId}
                    </h3>
                    <p className="text-xs text-slate-500">{agent.hostname}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {agent.isOnline ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" /> Offline
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3" /> {new Date(agent.lastSeen).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-slate-900/50 rounded-lg p-2 flex flex-col justify-center border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mb-1">CPU Load</span>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-lg font-black leading-none ${
                      agent.cpu > 80 ? 'text-rose-400' : agent.cpu > 50 ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {agent.cpu}%
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 flex flex-col justify-center border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Memory</span>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-lg font-black leading-none ${
                      agent.memory > 80 ? 'text-rose-400' : agent.memory > 50 ? 'text-amber-400' : 'text-violet-400'
                    }`}>
                      {agent.memory}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
