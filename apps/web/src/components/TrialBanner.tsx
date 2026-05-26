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
    <div className={`mb-5 rounded-xl border px-4 py-3 shadow-sm ${nearLimit ? 'border-amber-250 bg-amber-50/50' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${nearLimit ? 'bg-amber-100 border-amber-200' : 'bg-stone-50 border-stone-150'}`}>
            <Sparkles className={`h-3.5 w-3.5 ${nearLimit ? 'text-amber-600' : 'text-stone-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-stone-850">Free Tier</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 ring-1 ring-stone-200/60">
                TRIAL
              </span>
              {nearLimit && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200/50">
                  Approaching limit
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <UsageBar label="Agents" used={agentCount} limit={FREE_AGENT_LIMIT} pct={agentPct} />
              <UsageBar label="Incidents" used={incidentCount} limit={FREE_INCIDENT_LIMIT} pct={incidentPct} />
              <span className="text-xs text-stone-400 font-semibold">20-point rolling history · 1 webhook</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Upgrade <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UsageBar: React.FC<{ label: string; used: number; limit: number; pct: number }> = ({ label, used, limit, pct }) => {
  const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-600';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 font-semibold">{label}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-600">{used}/{limit}</span>
    </div>
  );
};
