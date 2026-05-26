import React from 'react';
import { AlertOctagon, Cpu, Database, BrainCircuit, ShieldCheck } from 'lucide-react';
import { IncidentData } from '../types';

interface IncidentPanelProps {
  incidents: IncidentData[];
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents }) => {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-premium animate-fadeIn">
      <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-rose-500" />
          <h2 className="text-sm font-bold text-stone-900">Incident Intelligence</h2>
        </div>
        {incidents.length > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
            {incidents.length} open
          </span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-stone-800">All systems nominal</p>
          <p className="mt-1 text-xs text-stone-400">No incidents detected</p>
        </div>
      ) : (
        <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
          {incidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="rounded-lg border border-stone-200 bg-stone-50/30 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                      inc.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 ring-rose-100'
                        : 'bg-amber-50 text-amber-700 ring-amber-100'
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${inc.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    {inc.severity}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    {inc.type === 'HIGH_CPU' ? (
                      <Cpu className="h-3 w-3 text-indigo-650" />
                    ) : (
                      <Database className="h-3 w-3 text-violet-600" />
                    )}
                    <span className="font-semibold text-stone-700">{inc.agentId}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-stone-450 font-semibold">
                  {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-semibold text-stone-800 leading-normal">{inc.message}</p>

              {inc.aiSummary && (
                <div className="flex items-start gap-2.5 rounded-lg border border-violet-100 bg-violet-50/30 p-3">
                  <BrainCircuit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">AI Incident Analysis</p>
                    <p className="text-xs text-stone-600 italic leading-relaxed">{inc.aiSummary}</p>
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
