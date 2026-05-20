import React from 'react';
import { AlertOctagon, Cpu, Database, BrainCircuit } from 'lucide-react';
import { IncidentData } from '../types';

interface IncidentPanelProps {
  incidents: IncidentData[];
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/85 rounded-2xl p-6 shadow-2xl mt-8">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800/80">
        <AlertOctagon className="w-6 h-6 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-200">Incident Intelligence</h2>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm font-medium">
          No system incidents detected. Operational status is nominal.
        </div>
      ) : (
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
          {incidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 shadow-md space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/35 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    {inc.severity}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {new Date(inc.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  {inc.type === 'HIGH_CPU' ? (
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Database className="w-3.5 h-3.5 text-violet-400" />
                  )}
                  <span>{inc.agentId}</span>
                  <span className="text-slate-600">({inc.hostname})</span>
                </div>
              </div>

              <div className="text-sm font-bold text-slate-200">
                {inc.message}
              </div>

              {inc.aiSummary && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-cyan-950/15 border border-cyan-500/15 text-cyan-200 text-xs shadow-inner leading-relaxed animate-fadeIn">
                  <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[10px] text-cyan-400 block mb-1">
                      AI Incident Analyst
                    </span>
                    <p className="italic font-medium">{inc.aiSummary}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
