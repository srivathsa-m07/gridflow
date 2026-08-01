import React from 'react';
import { Bell, BrainCircuit, GitBranch, Globe, Shield, Zap } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const FEATURES = [
  { icon: Zap, title: 'Sub-second telemetry', desc: 'Agents stream CPU, memory, and uptime every 5 seconds via lightweight HTTP. No scraping, no polling overhead.' },
  { icon: BrainCircuit, title: 'AI incident intelligence', desc: 'When thresholds breach, Gemini generates plain-English diagnostic summaries — so you know why, not just what.' },
  { icon: Globe, title: 'Real-time topology', desc: 'Visualize your entire infrastructure as a live map. Online, offline, and incident-active nodes update instantly.' },
  { icon: Shield, title: 'Organization isolation', desc: 'Multi-tenant architecture with JWT auth. Each organization sees only its own agents, metrics, and incidents.' },
  { icon: Bell, title: 'Webhook notifications', desc: 'Route critical incidents to Discord or Slack the moment they trigger. Configurable per organization.' },
  { icon: GitBranch, title: 'Docker-native agents', desc: 'Deploy monitoring agents to any server in seconds with a single docker run command. No Node.js required.' },
];

const STEPS = [
  { n: '01', title: 'Create your organization', desc: 'Sign up and get an isolated workspace in under 30 seconds.' },
  { n: '02', title: 'Provision an agent', desc: 'Click New Agent, name it, and copy your generated AGENT_KEY.' },
  { n: '03', title: 'Deploy via Docker', desc: 'Run one docker command on any server. The agent connects immediately.' },
  { n: '04', title: 'Monitor in real time', desc: 'Watch metrics, topology, and AI-powered incidents live on the dashboard.' },
];

export const LandingPage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '88px 0 64px' }}>
      <div style={{ maxWidth: 760, marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Observability, simplified</div>
        <H1>A unified telemetry platform for modern infrastructure teams.</H1>
        <Lead style={{ marginTop: 20, maxWidth: 680 }}>Collect, analyze, and act on infrastructure health with a single enterprise-ready dashboard.</Lead>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 30 }}>
          <Button asLink href="/login" variant="blue">Get started</Button>
          <Button asLink href="/docs" variant="secondary">Learn more</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} style={{ padding: 24, minHeight: 180 }}>
            <Icon size={22} color="var(--accent)" />
            <h2 style={{ marginTop: 18, marginBottom: 12, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
            <p style={{ margin: 0, color: 'var(--text-3)', lineHeight: 1.85 }}>{desc}</p>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 24, marginTop: 40 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>From local agent to live operations in minutes.</h2>
        <p style={{ marginTop: 16, color: 'var(--text-3)', fontSize: 15, lineHeight: 1.8 }}>GRIDFLOW is built to deploy quickly and scale confidently across teams and environments.</p>
        <div style={{ display: 'grid', gap: 18, marginTop: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {STEPS.map((step) => (
            <Card key={step.n} style={{ padding: 22, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 14, background: 'rgba(56,189,248,0.15)', color: 'var(--accent)', fontWeight: 700 }}>{step.n}</span>
              <h3 style={{ marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{step.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-3)', lineHeight: 1.8 }}>{step.desc}</p>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  </MarketingShell>
);
