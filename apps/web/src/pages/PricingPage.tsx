import React from 'react';
import { ArrowRight, CheckCircle2, Minus } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { H1, Lead } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const TIERS = [
  { name: 'Free', price: '$0', period: 'forever', badge: null, desc: 'For individuals and small projects evaluating GRIDFLOW.', cta: 'Get started free', ctaTo: '/login', variant: 'secondary', highlights: ['3 agents', '25 incident records', '20-point history', '1 webhook'] },
  { name: 'Pro', price: '$29', period: 'per month', badge: 'Most popular', desc: 'For growing teams that need reliable observability at scale.', cta: 'Start Pro trial', ctaTo: '/login', variant: 'blue', highlights: ['25 agents', 'Unlimited incidents', '90-day history', '10 webhooks'] },
  { name: 'Enterprise', price: 'Custom', period: 'contact us', badge: null, desc: 'For large organizations with advanced security and compliance needs.', cta: 'Contact sales', ctaTo: '/docs', variant: 'secondary', highlights: ['Unlimited agents', 'Unlimited incidents', '1-year history', 'Unlimited webhooks'] },
];

const COMPARISON = [
  { feature: 'Monitored agents', free: '3', pro: '25', enterprise: 'Unlimited' },
  { feature: 'Incident records', free: '25', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Metric history', free: '20 points', pro: '90 days', enterprise: '1 year' },
  { feature: 'Webhook channels', free: '1', pro: '10', enterprise: 'Unlimited' },
  { feature: 'AI summaries', free: true, pro: true, enterprise: true },
  { feature: 'Topology visualization', free: true, pro: true, enterprise: true },
  { feature: 'Priority support', free: false, pro: true, enterprise: true },
  { feature: 'SLA guarantee', free: false, pro: false, enterprise: true },
  { feature: 'SSO / SAML', free: false, pro: false, enterprise: true },
  { feature: 'Audit logs', free: false, pro: false, enterprise: true },
];

type Val = string | boolean | null;

const Cell: React.FC<{ val: Val }> = ({ val }) => {
  if (val === true) return <CheckCircle2 style={{ margin: '0 auto', color: 'var(--ok)' }} size={16} />;
  if (val === false) return <Minus style={{ margin: '0 auto', color: 'var(--text-3)' }} size={16} />;
  return <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{val}</span>;
};

export const PricingPage: React.FC = () => (
  <MarketingShell>
    <section style={{ padding: '88px 0 64px' }}>
      <div style={{ maxWidth: 740, marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Pricing</div>
        <H1>Simple, transparent pricing.</H1>
        <Lead style={{ marginTop: 20 }}>Start free and scale when you need to. No hidden fees, no surprise limits.</Lead>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 40 }}>
        {TIERS.map((tier) => (
          <Card key={tier.name} style={{ position: 'relative', padding: 24, borderColor: tier.badge ? 'rgba(31,109,74,0.12)' : 'var(--border)' }}>
            {tier.badge && <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', borderRadius: 999, background: 'var(--accent-blue)', padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>{tier.badge}</span>}
            <div style={{ marginBottom: 18 }}>
              <div style={{ margin: 0, marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{tier.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>{tier.price}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{tier.period}</div>
              </div>
              <div style={{ marginTop: 12, color: 'var(--text-3)', fontSize: 14 }}>{tier.desc}</div>
            </div>
            <ul style={{ margin: 0, marginBottom: 18, listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
              {tier.highlights.map((highlight) => (
                <li key={highlight} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-3)', fontSize: 14 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--ok)' }} />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <Button asLink href={tier.ctaTo} variant={tier.variant as any} style={{ width: '100%', justifyContent: 'center' }}>{tier.cta}<ArrowRight size={16} /></Button>
          </Card>
        ))}
      </div>

      <p className="overline mobile-only-hint" style={{ display: 'none', color: 'var(--text-3)', marginBottom: 10 }}>Swipe to compare plans →</p>
      <Card style={{ overflowX: 'auto', borderRadius: 20, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-3)' }}>Feature</th>
              {TIERS.map((tier) => (
                <th key={tier.name} style={{ textAlign: 'center', padding: '16px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{tier.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map(({ feature, free, pro, enterprise }, index) => (
              <tr key={feature} style={{ background: index % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '14px 18px', color: 'var(--text-3)' }}>{feature}</td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}><Cell val={free} /></td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}><Cell val={pro} /></td>
                <td style={{ padding: '14px 18px', textAlign: 'center' }}><Cell val={enterprise} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ padding: 24, borderRadius: 20, marginTop: 24 }}>
        <p style={{ margin: 0, marginBottom: 16, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>All plans include</p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', color: 'var(--text-3)', fontSize: 14 }}>
          {['TLS-encrypted telemetry', 'JWT agent keys', 'Organization isolation', 'MongoDB persistence', 'Open-source agent'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--ok)' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  </MarketingShell>
);
