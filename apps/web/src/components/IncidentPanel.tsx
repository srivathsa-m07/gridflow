import React from 'react';
import { AlertOctagon, Cpu, Database, BrainCircuit, ShieldCheck } from 'lucide-react';
import { IncidentData } from '../types';

interface IncidentPanelProps {
  incidents: IncidentData[];
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-slate-200">Incident Intelligence</h2>
        </div>
        {incidents.length > 0 && (
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 ring-1 ring-rose-500/20">
            {incidents.length} open
          </span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-300">All systems nominal</p>
          <p className="mt-1 text-xs text-slate-600">No incidents detected</p>
        </div>
      ) : (
        <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
          {incidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                      inc.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 ring-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${inc.severity === 'critical' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                    {inc.severity}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {inc.type === 'HIGH_CPU' ? (
                      <Cpu className="h-3 w-3 text-cyan-500" />
                    ) : (
                      <Database className="h-3 w-3 text-violet-500" />
                    )}
                    <span>{inc.agentId}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">
                  {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-medium text-slate-300">{inc.message}</p>

              {inc.aiSummary && (
                <div className="flex items-start gap-2 rounded-lg border border-violet-500/15 bg-violet-950/20 p-3">
                  <BrainCircuit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-400">AI Analysis</p>
                    <p className="text-xs text-slate-400 italic leading-relaxed">{inc.aiSummary}</p>
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
