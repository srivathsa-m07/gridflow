import React from 'react';
import { Card } from './ui/Card';
import { AgentData, IncidentData } from '../types';

interface AnalyticsPanelProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

const Stat: React.FC<{ label: string; value: string | number; accent?: string }> = ({ label, value, accent = 'var(--d-text)' }) => (
  <div style={{ padding: '18px 20px', borderRight: '1px solid var(--d-border)' }}>
    <p style={{ margin: 0, marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--d-text-3)' }}>{label}</p>
    <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: accent, lineHeight: 1 }}>{value}</span>
  </div>
);

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ agents, incidents }) => {
  const online = agents.filter(a => a.isOnline).length;
  const healthy = agents.filter(a => a.status === 'healthy').length;
  const critical = agents.filter(a => a.status === 'critical').length;
  // Only average agents that have actually reported a numeric reading —
  // an agent that hasn't sent telemetry yet must not silently turn the
  // whole average into NaN.
  const numericCpuReadings = agents.map(a => a.cpu).filter((c): c is number => typeof c === 'number' && !Number.isNaN(c));
  const avgCpu = numericCpuReadings.length
    ? Math.round(numericCpuReadings.reduce((s, c) => s + c, 0) / numericCpuReadings.length)
    : null;

  return (
    <Card variant="dark" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--d-border)' }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--d-text-3)' }}>Fleet overview</p>
          <h2 style={{ margin: '8px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--d-text)' }}>Operational summary</h2>
        </div>
        <span style={{ fontSize: 11, color: 'var(--d-text-3)' }}>{agents.length} registered</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        <Stat label="Online" value={online} accent={online > 0 ? 'var(--ok)' : 'var(--d-text-3)'} />
        <Stat label="Healthy" value={healthy} accent={healthy > 0 ? 'var(--d-text)' : 'var(--d-text-3)'} />
        <Stat label="Critical" value={critical} accent={critical > 0 ? 'var(--crit)' : 'var(--d-text-3)'} />
        <Stat label="Incidents" value={incidents.length} accent={incidents.length > 0 ? 'var(--warn)' : 'var(--d-text-3)'} />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ margin: 0, marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--d-text-3)' }}>Avg CPU</p>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: avgCpu === null ? 'var(--d-text-3)' : avgCpu > 80 ? 'var(--crit)' : avgCpu > 50 ? 'var(--warn)' : 'var(--d-text)', lineHeight: 1 }}>{avgCpu === null ? '—' : `${avgCpu}%`}</span>
        </div>
      </div>
    </Card>
  );
};
