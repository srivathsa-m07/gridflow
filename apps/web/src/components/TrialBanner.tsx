import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';

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
    <Card variant="dark" style={{ padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: '1 1 320px' }}>
          <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 12, background: nearLimit ? 'rgba(245,158,11,0.15)' : 'var(--d-overlay)' }}>
            <Sparkles size={16} color={nearLimit ? 'var(--warn)' : 'var(--d-text-2)'} />
          </div>
          <div style={{ minWidth: 0, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--d-text)' }}>Free tier</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: 'var(--d-overlay)', color: 'var(--d-text-2)', fontSize: 10, fontWeight: 700, border: '1px solid var(--d-border)' }}>TRIAL</span>
              {nearLimit && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: 'var(--warn)', fontSize: 10, fontWeight: 700, border: '1px solid rgba(245,158,11,0.25)' }}>Approaching limit</span>}
            </div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <UsageBar label="Agents" used={agentCount} limit={FREE_AGENT_LIMIT} pct={agentPct} />
              <UsageBar label="Incidents" used={incidentCount} limit={FREE_INCIDENT_LIMIT} pct={incidentPct} />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--d-text-3)', marginBottom: 6 }}>Retention</span>
                <span style={{ fontSize: 12, color: 'var(--d-text-3)' }}>20-point rolling metric history · 1 webhook</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'var(--accent-blue)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            Upgrade <ArrowRight size={14} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            type="button"
            style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 12, border: '1px solid transparent', background: 'var(--d-overlay)', color: 'var(--d-text-2)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};

const UsageBar: React.FC<{ label: string; used: number; limit: number; pct: number }> = ({ label, used, limit, pct }) => {
  const barColor = pct >= 100 ? 'var(--crit)' : pct >= 80 ? 'var(--warn)' : 'var(--accent-blue)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--d-text-3)', minWidth: 56 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--d-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: barColor, transition: 'width 0.25s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--d-text-2)' }}>{used}/{limit}</span>
    </div>
  );
};
