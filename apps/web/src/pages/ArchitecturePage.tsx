import React from 'react';
import { Activity, ArrowRight, BrainCircuit, Database, Globe, Server, Zap } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, H2, Lead } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const PIPELINE = [
  { step: '01', icon: Server, accent: '#38bdf8', title: 'Extraction', desc: 'Agents collect CPU, memory, and uptime every 5 seconds.' },
  { step: '02', icon: Zap, accent: '#f59e0b', title: 'Ingestion', desc: 'The gateway validates payloads and authenticates via AGENT_KEY.' },
  { step: '03', icon: Globe, accent: '#34d399', title: 'Registry enrichment', desc: 'Agent status, lastSeen, and health state are updated in real time.' },
  { step: '04', icon: BrainCircuit, accent: '#a78bfa', title: 'Incident processing', desc: 'Threshold breaches trigger AI summaries and notifications.' },
  { step: '05', icon: Activity, accent: '#38bdf8', title: 'Real-time broadcast', desc: 'Socket.IO pushes updates to all connected dashboards.' },
  { step: '06', icon: Database, accent: '#6b7280', title: 'Storage', desc: 'Telemetry and incident data persist in MongoDB Atlas.' },
];

const STACK = [
  { layer: 'Agent', tech: 'Node.js + TypeScript', detail: 'systeminformation, dotenv, lightweight Docker image' },
  { layer: 'Gateway', tech: 'Express + Socket.IO', detail: 'Authentication, metrics ingestion, AI orchestration' },
  { layer: 'Database', tech: 'MongoDB Atlas', detail: 'Agents, metrics, incidents, settings' },
  { layer: 'Dashboard', tech: 'React + Vite', detail: 'Real-time client, charts, topology, notifications' },
  { layer: 'AI Engine', tech: 'Gemini', detail: 'Asynchronous incident summarization' },
  { layer: 'Deployment', tech: 'Docker + Render', detail: 'Multi-stage builds with production config' },
];

export const ArchitecturePage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '88px 0 64px' }}>
      <div style={{ maxWidth: 760, marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>System architecture</div>
        <H1>Designed for resilient telemetry and secure operations.</H1>
        <Lead style={{ marginTop: 20 }}>GRIDFLOW decouples collection, ingestion, analysis, and presentation so each layer can scale independently.</Lead>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <H2 style={{ margin: 0 }}>Telemetry pipeline</H2>
          <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
            {PIPELINE.map(({ step, icon: Icon, accent, title, desc }, index) => (
              <div key={step} style={{ display: 'flex', gap: 14, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon size={16} color={accent} />
                  </div>
                  {index < PIPELINE.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.04)' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{step}</span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: 14 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <H2 style={{ margin: 0 }}>Technology stack</H2>
          <div style={{ marginTop: 12, overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>Layer</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>Technology</th>
                  <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {STACK.map(({ layer, tech, detail }, index) => (
                  <tr key={layer} style={{ background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text)' }}>{layer}</td>
                    <td style={{ padding: '14px 18px', fontSize: 12, fontFamily: 'var(--font-mono)', color: '#7dd3fc' }}>{tech}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-3)' }}>{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 20 }}>
        <H2 style={{ margin: 0 }}>Monorepo structure</H2>
        <pre style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, overflowX: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12 }}>
gridflow/
├── apps/
│   ├── agent/          # Telemetry daemon (Node.js)
│   ├── api/            # Telemetry gateway (Express + Socket.IO)
│   └── web/            # Operations console (React + Vite)
├── packages/           # Shared workspace packages
├── docker-compose.yml  # Full-stack local deployment
└── tsconfig.base.json  # Shared TypeScript config
        </pre>
      </Card>

      <Card style={{ padding: 24, marginTop: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>See it in action</div>
        <Lead style={{ marginTop: 8, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>Deploy your first agent and watch the pipeline update in real time.</Lead>
        <div style={{ marginTop: 14 }}>
          <Button asLink href="/login" variant="blue">Open dashboard <ArrowRight size={16} /></Button>
        </div>
      </Card>
    </section>
  </MarketingShell>
);
