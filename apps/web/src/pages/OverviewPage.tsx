import React from 'react';
import { ShieldCheck, ShieldAlert, Shield, Server, ArrowRight } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { MetricsChart } from '../components/MetricsChart';
import { AnalyticsPanel } from '../components/AnalyticsPanel';
import { ActivityFeed } from '../components/ActivityFeed';
import { AlertBanner } from '../components/AlertBanner';
import { Metrics, AlertData, IncidentData, AgentData, FeedEvent } from '../types';
import { Card } from '../components/ui/Card';
import { H2, Lead } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';

interface OverviewPageProps {
  metrics: Metrics | null;
  history: Metrics[];
  alerts: AlertData[];
  incidents: IncidentData[];
  agents: AgentData[];
  activityFeed: FeedEvent[];
  onDismissAlert: (id: string) => void;
  onNewAgent?: () => void;
}

const ONBOARDING_STEPS = [
  { n: '01', title: 'Provision an agent', desc: 'Click "New Agent" in the top bar, give it a name, and copy the generated key.' },
  { n: '02', title: 'Deploy via Docker', desc: 'Run the generated docker command on any server. No Node.js required.' },
  { n: '03', title: 'Watch it connect', desc: 'Your agent appears here within seconds and begins streaming telemetry.' },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  history,
  alerts,
  incidents,
  agents,
  activityFeed,
  onDismissAlert,
  onNewAgent,
}) => {
  const hasAgents = agents.length > 0;

  const statusBadge = () => {
    if (!metrics) return null;
    const cfg = {
      critical: {
        label: 'System Critical',
        icon: ShieldAlert,
        style: { backgroundColor: 'rgba(220,38,38,0.12)', borderColor: 'rgba(220,38,38,0.2)', color: 'var(--crit)' },
      },
      warning: {
        label: 'System Warning',
        icon: Shield,
        style: { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.2)', color: 'var(--warn)' },
      },
      healthy: {
        label: 'System Healthy',
        icon: ShieldCheck,
        style: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.2)', color: 'var(--ok)' },
      },
    }[metrics.status] ?? {
      label: 'Healthy',
      icon: ShieldCheck,
      style: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.2)', color: 'var(--ok)' },
    };
    const Icon = cfg.icon;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, border: '1px solid', padding: '8px 12px', fontSize: 12, fontWeight: 700, ...cfg.style }}>
        <Icon size={14} />
        <span>{cfg.label}</span>
      </div>
    );
  };

  // Empty state for new organizations with no agents
  if (!hasAgents && !metrics) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

        <Card style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ margin: '0 auto 12px', display: 'flex', height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16, background: 'var(--d-overlay)' }}>
              <Server size={22} color="var(--d-text-2)" />
            </div>
            <H2>No agents connected</H2>
            <Lead style={{ marginTop: 8 }}>Create your first monitoring agent to begin infrastructure telemetry collection.</Lead>
            {onNewAgent && (
              <div style={{ marginTop: 18 }}>
                <Button variant="blue" onClick={onNewAgent} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Provision your first agent <ArrowRight size={14} /></Button>
              </div>
            )}
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {ONBOARDING_STEPS.map(({ n, title, desc }) => (
            <Card key={n} variant="darkOverlay" style={{ padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--d-text-3)' }}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {metrics && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: 'var(--d-text-2)' }}>Last update: {metrics.formattedTime || '—'} · Agent: <span style={{ color: 'var(--d-text)', fontWeight: 700 }}>{metrics.agentId || 'local'}</span></div>
          <div>{statusBadge()}</div>
        </div>
      )}

      <AlertBanner alerts={alerts} onDismiss={onDismissAlert} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 340px' }}>
        <AnalyticsPanel agents={agents} incidents={incidents} />
        <div>
          <ActivityFeed events={activityFeed} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <MetricCard
          title="CPU Load"
          value={metrics ? metrics.cpu : '—'}
          unit="%"
          accentColor="var(--accent-blue)"
          showProgress
          progressValue={metrics?.cpu ?? 0}
        />
        <MetricCard
          title="Memory Used"
          value={metrics ? metrics.memory : '—'}
          unit="%"
          accentColor="#8b5cf6"
          showProgress
          progressValue={metrics?.memory ?? 0}
        />
        <MetricCard
          title="System Uptime"
          value={metrics ? metrics.uptime : '—'}
          unit="hrs"
          accentColor="#f59e0b"
        />
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr 1fr' }}>
        <MetricsChart
          title="CPU Usage"
          data={history}
          dataKey="cpu"
          color="#06b6d4"
          gradientId="cpuGrad"
        />
        <MetricsChart
          title="Memory Usage"
          data={history}
          dataKey="memory"
          color="#8b5cf6"
          gradientId="memGrad"
        />
      </div>
    </div>
  );
};
