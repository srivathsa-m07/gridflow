import React from 'react';
import { BrainCircuit, Globe, Zap, Cpu, Activity } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const FEATURES = [
  { icon: Zap, title: 'Sub-second telemetry', desc: 'Agents stream CPU, memory, and uptime every 5 seconds via lightweight HTTP. No scraping, no polling overhead.' },
  { icon: BrainCircuit, title: 'AI incident intelligence', desc: 'When thresholds breach, Gemini generates plain-English diagnostic summaries — so you know why, not just what.' },
  { icon: Globe, title: 'Real-time topology', desc: 'Visualize your entire infrastructure as a live map. Online, offline, and incident-active nodes update instantly.' },
];

const STEPS = [
  { n: '1', title: 'Create your organization', desc: 'Sign up and get an isolated workspace in under 30 seconds.' },
  { n: '2', title: 'Provision an agent', desc: 'Click New Agent, name it, and copy your one-time provisioning token.' },
  { n: '3', title: 'Deploy via Docker', desc: 'Run one docker command on any server. The agent connects immediately.' },
  { n: '4', title: 'Monitor in real time', desc: 'Watch metrics, topology, and AI-powered incidents live on the dashboard.' },
];

const FLEET_RAIL = ['db-primary-01', 'edge-cache-03', 'web-prod-01', 'worker-queue-02', 'api-gateway-01'];

// Decorative line-art radiating from the hero card, echoing the reference's
// wavy-field background — pure SVG, no external asset.
const HeroLines: React.FC = () => {
  const lines = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 1100 360" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} preserveAspectRatio="xMidYMid slice">
      <g stroke="var(--accent)" fill="none" strokeWidth="1">
        {lines.map((_, i) => {
          const t = i / (lines.length - 1);
          const y = 40 + t * 280;
          const amp = 30 + t * 40 * (i % 2 === 0 ? 1 : -1);
          return (
            <path
              key={`l-${i}`}
              opacity={0.08 + (1 - Math.abs(t - 0.5) * 2) * 0.14}
              d={`M -20 ${y} C 260 ${y + amp}, 400 ${180 + (t - 0.5) * 40}, 550 180 S 840 ${y + amp}, 1120 ${y}`}
            />
          );
        })}
      </g>
    </svg>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ padding: '18px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(15,42,30,0.08)' }}>
    <p className="overline" style={{ margin: 0, marginBottom: 8, color: 'var(--text-3)' }}>{label}</p>
    <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
  </div>
);

// Diagram node used by the telemetry-flow schematic — a small "bracket"
// shaped box, echoing the reference's asymmetric-corner role boxes.
const FlowNode: React.FC<{ label: string; corner: 'tl' | 'tr' | 'bl' | 'br' }> = ({ label, corner }) => {
  const radii: Record<typeof corner, string> = {
    tl: '4px 28px 4px 4px',
    tr: '28px 4px 4px 4px',
    bl: '4px 4px 4px 28px',
    br: '4px 4px 28px 4px',
  };
  return (
    <div style={{
      padding: '16px 22px', border: '1px solid var(--text)', borderRadius: radii[corner],
      fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'var(--text)', textAlign: corner.includes('l') ? 'left' : 'right',
      background: 'var(--surface)',
    }}>
      {label}
    </div>
  );
};

const ConnectorLabel: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({ children, align = 'left' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
    {align === 'left' && <div style={{ flex: 1, borderTop: '1px dashed var(--text-3)' }} />}
    <span className="overline" style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{children}</span>
    {align === 'right' && <div style={{ flex: 1, borderTop: '1px dashed var(--text-3)' }} />}
  </div>
);

export const LandingPage: React.FC = () => (
  <MarketingShell>
    {/* ── Hero ─────────────────────────────────────────────────────── */}
    <section style={{ position: 'relative', padding: '72px 0 40px', textAlign: 'center', overflow: 'hidden' }}>
      <HeroLines />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Card style={{ display: 'inline-block', textAlign: 'left', padding: 24, width: 340, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--text)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Cpu size={18} color="var(--bg)" />
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>web-prod-01</p>
              <p className="overline" style={{ margin: 0, color: 'var(--text-3)' }}>Compute Agent</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['Docker', 'Online'].map((tag) => (
              <span key={tag} className="overline" style={{ padding: '5px 12px', borderRadius: 999, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{tag}</span>
            ))}
          </div>

          <Lead style={{ marginBottom: 18 }}>Streams CPU, memory, and uptime telemetry every 5 seconds with automatic incident detection.</Lead>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {[['CPU', '34%'], ['Memory', '58%'], ['Last seen', '12s']].map(([label, value]) => (
              <div key={label}>
                <p className="overline" style={{ margin: 0, marginBottom: 6, color: 'var(--text-3)' }}>{label}</p>
                <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 28 }}>
          {FLEET_RAIL.map((name, i) => (
            <span
              key={name}
              className="overline"
              style={{
                padding: '8px 16px', borderRadius: 999,
                border: `1px solid ${i === 2 ? 'var(--accent)' : 'var(--border)'}`,
                color: i === 2 ? 'var(--accent)' : 'var(--text-3)',
                background: i === 2 ? 'rgba(31,109,74,0.06)' : 'transparent',
              }}
            >
              {name}
            </span>
          ))}
        </div>

        <div style={{ maxWidth: 720, margin: '56px auto 0' }}>
          <H1 style={{ fontSize: 40 }}>Radically transforming infrastructure, in real time</H1>
          <Lead style={{ marginTop: 20, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Building a unified telemetry platform that displaces scattered dashboards and manual polling at every stage of the incident lifecycle.
          </Lead>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30, justifyContent: 'center' }}>
            <Button asLink href="/login" variant="blue">Get started</Button>
            <Button asLink href="/docs" variant="secondary">Learn more</Button>
          </div>
        </div>
      </div>
    </section>

    {/* ── Telemetry panel: full-width tinted section, asymmetric 2-col ─ */}
    <section style={{ padding: '48px 0' }}>
      <Card style={{ padding: 36, background: 'var(--surface-tint)', border: '1px solid rgba(15,42,30,0.1)' }}>
        <div className="grid-2col" style={{ display: 'grid', gap: 32, gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.2, fontWeight: 600, color: 'var(--text)' }}>
              Telemetry, the operational source of truth
            </h2>
            <Lead style={{ marginTop: 16, maxWidth: 420 }}>
              Every agent reports CPU, memory, and uptime on independent heartbeat and metrics channels, so liveness never depends on a slow collection cycle.
            </Lead>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Button asLink href="/login" variant="blue">Open dashboard</Button>
              <Button asLink href="/docs" variant="secondary">Documents</Button>
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: 'rgba(15,42,30,0.06)', marginBottom: 18 }}>
              {['Fleet', 'Incidents'].map((label, i) => (
                <span key={label} className="overline" style={{
                  padding: '7px 16px', borderRadius: 999,
                  background: i === 0 ? 'var(--text)' : 'transparent',
                  color: i === 0 ? 'var(--bg)' : 'var(--text-3)',
                }}>{label}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <StatBox label="Agents online" value="128" />
              <StatBox label="Avg CPU" value="34%" />
              <StatBox label="Incidents/mo" value="6" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid-3col" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 16 }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} style={{ padding: 24, background: 'var(--surface-tint)', border: '1px solid rgba(15,42,30,0.1)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.5)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
              <Icon size={20} color="var(--accent)" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
            <Lead>{desc}</Lead>
          </Card>
        ))}
      </div>
    </section>

    {/* ── Deploy: asymmetric card-left / bare-grid-right ──────────────── */}
    <section style={{ padding: '24px 0 48px' }}>
      <div className="grid-2col" style={{ display: 'grid', gap: 40, gridTemplateColumns: '0.85fr 1.15fr', alignItems: 'start' }}>
        <Card style={{ padding: 32, background: 'var(--surface-tint-2)', border: '1px solid rgba(15,42,30,0.1)' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: 'var(--text)' }}>Deploy</h2>
          <Lead style={{ marginTop: 16 }}>
            Expand coverage across every host with a single published image. Self-provision through short-lived, single-use tokens — no long-lived secrets ever leave the dashboard.
          </Lead>
          <div style={{ display: 'grid', placeItems: 'center', margin: '32px 0' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', display: 'grid', placeItems: 'center' }}>
              <Activity size={40} color="var(--accent)" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button asLink href="/login" variant="blue">Open dashboard</Button>
            <Button asLink href="/docs" variant="secondary">Documents</Button>
          </div>
        </Card>

        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px 32px' }}>
          {STEPS.map((step) => (
            <div key={step.n}>
              <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
                {step.n}. {step.title}
              </h3>
              <Lead>{step.desc}</Lead>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Telemetry-flow schematic ─────────────────────────────────── */}
    <section style={{ padding: '24px 0 72px', textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 48px', fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 600, color: 'var(--text)' }}>
        Where telemetry creates signal
      </h2>

      <div className="flow-diagram" style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', alignItems: 'center', gap: 20, textAlign: 'left' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <FlowNode label="Agent" corner="tl" />
          <div className="flow-diagram-connector"><ConnectorLabel align="right">Heartbeat + metrics</ConnectorLabel></div>
          <FlowNode label="Incident engine" corner="bl" />
        </div>

        <div className="flow-diagram-hub" style={{
          justifySelf: 'center', width: 200, height: 200, borderRadius: '50%',
          border: '1px solid var(--text)', display: 'grid', placeItems: 'center', position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px dashed var(--text-3)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Gateway</span>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="flow-diagram-connector"><ConnectorLabel>Lifecycle status</ConnectorLabel></div>
          <FlowNode label="Dashboard" corner="tr" />
          <FlowNode label="Notifications" corner="br" />
        </div>
      </div>
    </section>
  </MarketingShell>
);
