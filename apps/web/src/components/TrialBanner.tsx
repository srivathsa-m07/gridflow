import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface TrialBannerProps {
  agentCount: number;
  incidentCount: number;
}

const FREE_AGENT_LIMIT = 3;
const FREE_INCIDENT_LIMIT = 25;

export const TrialBanner: React.FC<TrialBannerProps> = ({ agentCount, incidentCount }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const agentPct = Math.min(100, Math.round((agentCount / FREE_AGENT_LIMIT) * 100));
  const incidentPct = Math.min(100, Math.round((incidentCount / FREE_INCIDENT_LIMIT) * 100));
  const nearLimit = agentPct >= 80 || incidentPct >= 80;

  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 ${nearLimit ? 'border-amber-500/25 bg-amber-500/5' : 'border-slate-700/60 bg-slate-900/60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${nearLimit ? 'bg-amber-500/15' : 'bg-slate-800'}`}>
            <Sparkles className={`h-3.5 w-3.5 ${nearLimit ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-200">Free tier</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-700">
                TRIAL
              </span>
              {nearLimit && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/25">
                  Approaching limit
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <UsageBar label="Agents" used={agentCount} limit={FREE_AGENT_LIMIT} pct={agentPct} />
              <UsageBar label="Incidents" used={incidentCount} limit={FREE_INCIDENT_LIMIT} pct={incidentPct} />
              <span className="text-xs text-slate-500">20-point rolling metric history · 1 webhook</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Upgrade <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-slate-600 hover:text-slate-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UsageBar: React.FC<{ label: string; used: number; limit: number; pct: number }> = ({ label, used, limit, pct }) => {
  const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-cyan-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-400">{used}/{limit}</span>
    </div>
  );
};
