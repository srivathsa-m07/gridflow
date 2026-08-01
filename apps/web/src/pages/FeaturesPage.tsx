import React from 'react';
import { ArrowRight, BrainCircuit, Globe, GitBranch, Shield, Zap } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const SECTIONS = [
  { icon: Zap, accent: '#38bdf8', title: 'Low-overhead telemetry agents', desc: 'Lightweight agents collect CPU, memory, and uptime every 5 seconds with minimal resource usage.', points: ['CPU load, resident memory, uptime', 'Alpine-based Docker image', 'Graceful shutdown', 'Retry on network failure'] },
  { icon: BrainCircuit, accent: '#a78bfa', title: 'AI incident intelligence', desc: 'The incident engine generates concise summaries so operations teams always know the likely cause.', points: ['Gemini summaries', '60-second cooldown per agent', 'Persisted incident context', 'Real-time push updates'] },
  { icon: Globe, accent: '#34d399', title: 'Real-time topology visualization', desc: 'Your infrastructure map updates as agents connect, disconnect, and trigger events.', points: ['Live online/offline state', 'Incident overlays', 'Last-seen timestamps', 'Organization-scoped view'] },
  { icon: Shield, accent: '#f59e0b', title: 'Secure tenant isolation', desc: 'Organizations are isolated by design: agents, metrics, incidents, and settings never overlap.', points: ['JWT workspace isolation', 'Scoped agent registry', 'Socket.IO room separation', 'Secure key provisioning'] },
  { icon: GitBranch, accent: '#38bdf8', title: 'Webhook notifications', desc: 'Deliver critical incident alerts to Discord and Slack instantly.', points: ['Discord webhooks', 'Slack webhooks', 'Organization-level settings', 'Incident delivery retries'] },
];

export const FeaturesPage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '88px 0 64px' }}>
      <div style={{ maxWidth: 760, marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Platform features</div>
        <H1>Built to help operations teams move quickly with confidence.</H1>
        <Lead style={{ marginTop: 20 }}>Every feature in GRIDFLOW is designed to reduce complexity and keep visibility sharp across your infrastructure.</Lead>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {SECTIONS.map(({ icon: Icon, accent, title, desc, points }) => (
          <Card key={title} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}15`, display: 'grid', placeItems: 'center', border: `1px solid ${accent}25` }}>
                <Icon size={20} color={accent} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
                <div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: 14 }}>{desc}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              {points.map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 6, background: accent }} />
                  <span style={{ color: 'var(--text-3)', fontSize: 14 }}>{point}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 28, marginTop: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, color: 'var(--text-3)', marginBottom: 22 }}>
          <GitBranch size={20} />
          <Globe size={20} />
          <Shield size={20} />
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Ready to deploy?</h2>
        <p style={{ margin: '12px auto 0', maxWidth: 560, color: 'var(--text-3)', fontSize: 15, lineHeight: 1.75 }}>Get your first agent streaming telemetry in under two minutes.</p>
        <Button asLink href="/login" variant="blue" style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 20px', fontSize: 13 }}>
          Open dashboard <ArrowRight size={16} />
        </Button>
      </Card>
    </section>
  </MarketingShell>
);
