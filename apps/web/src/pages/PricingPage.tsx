import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Minus, ArrowRight, ArrowLeft } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    badge: null,
    desc: 'For individuals and small projects evaluating GRIDFLOW.',
    cta: 'Get started free',
    ctaTo: '/login',
    ctaStyle: 'border border-stone-200 bg-white text-stone-750 hover:bg-stone-50 hover:border-stone-300',
    highlights: ['3 agents', '25 incident records', '20-point rolling history', '1 webhook'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    badge: 'Most popular',
    desc: 'For growing teams that need reliable infrastructure monitoring.',
    cta: 'Start Pro trial',
    ctaTo: '/login',
    ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-750 shadow-sm',
    highlights: ['25 agents', 'Unlimited incidents', '90-day history', '10 webhooks'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    badge: null,
    desc: 'For organizations with advanced security and compliance needs.',
    cta: 'Contact sales',
    ctaTo: '/docs',
    ctaStyle: 'border border-stone-200 bg-white text-stone-750 hover:bg-stone-50 hover:border-stone-300',
    highlights: ['Unlimited agents', 'Unlimited incidents', '1-year history', 'Unlimited webhooks'],
  },
];

type Val = string | boolean | null;

const COMPARISON: { feature: string; free: Val; pro: Val; enterprise: Val }[] = [
  { feature: 'Monitored agents',         free: '3',           pro: '25',          enterprise: 'Unlimited' },
  { feature: 'Incident records',         free: '25',          pro: 'Unlimited',   enterprise: 'Unlimited' },
  { feature: 'Metric history',           free: '20 points',   pro: '90 days',     enterprise: '1 year' },
  { feature: 'Webhook channels',         free: '1',           pro: '10',          enterprise: 'Unlimited' },
  { feature: 'Real-time telemetry',      free: true,          pro: true,          enterprise: true },
  { feature: 'AI incident summaries',    free: true,          pro: true,          enterprise: true },
  { feature: 'Topology visualization',   free: true,          pro: true,          enterprise: true },
  { feature: 'Organization isolation',   free: true,          pro: true,          enterprise: true },
  { feature: 'Docker agent deployment',  free: true,          pro: true,          enterprise: true },
  { feature: 'Discord / Slack alerts',   free: false,         pro: true,          enterprise: true },
  { feature: 'Priority support',         free: false,         pro: true,          enterprise: true },
  { feature: 'SLA guarantee',            free: false,         pro: false,         enterprise: true },
  { feature: 'SSO / SAML',              free: false,         pro: false,         enterprise: true },
  { feature: 'Audit logs',              free: false,         pro: false,         enterprise: true },
  { feature: 'Dedicated onboarding',    free: false,         pro: false,         enterprise: true },
];

const Cell: React.FC<{ val: Val }> = ({ val }) => {
  if (val === true)  return <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />;
  if (val === false) return <Minus className="mx-auto h-4 w-4 text-stone-300" />;
  return <span className="text-xs font-semibold text-stone-700">{val}</span>;
};

export const PricingPage: React.FC = () => (
  <div className="min-h-screen bg-[#fbfcfa] text-stone-850 font-sans">
    {/* Nav */}
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-[#fbfcfa]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
            <Activity className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-sm font-bold tracking-tight text-stone-900">GRIDFLOW</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <Link to="/login" className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm">
            Get started
          </Link>
        </div>
      </div>
    </nav>

    <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Pricing</p>
        <h1 className="text-4xl font-extrabold text-stone-900">Simple, transparent pricing</h1>
        <p className="mx-auto mt-4 max-w-lg text-stone-600">
          Start free. Scale when you need to. No hidden fees, no credit card required to get started.
        </p>
      </div>

      {/* Tier cards */}
      <div className="mb-16 grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-6 bg-white shadow-premium ${
              tier.badge
                ? 'border-indigo-300 ring-4 ring-indigo-50/50'
                : 'border-stone-200'
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-650 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                {tier.badge}
              </span>
            )}
            <div className="mb-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-400">{tier.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-stone-900">{tier.price}</span>
                <span className="text-sm text-stone-400">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">{tier.desc}</p>
            </div>

            <ul className="mb-6 flex-1 space-y-2">
              {tier.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-stone-700">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {h}
                </li>
              ))}
            </ul>

            <Link
              to={tier.ctaTo}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tier.ctaStyle}`}
            >
              {tier.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div>
        <h2 className="mb-6 text-center text-lg font-bold text-stone-900">Full feature comparison</h2>
        <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-premium bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-stone-500">Feature</th>
                {TIERS.map((t) => (
                  <th key={t.name} className="px-5 py-3.5 text-center text-xs font-semibold text-stone-700">{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(({ feature, free, pro, enterprise }, i) => (
                <tr key={feature} className={`border-b border-stone-100 ${i % 2 === 0 ? '' : 'bg-stone-50/10'}`}>
                  <td className="px-5 py-3 text-stone-600 font-medium">{feature}</td>
                  <td className="px-5 py-3 text-center"><Cell val={free} /></td>
                  <td className="px-5 py-3 text-center"><Cell val={pro} /></td>
                  <td className="px-5 py-3 text-center"><Cell val={enterprise} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust footer */}
      <div className="mt-14 rounded-2xl border border-stone-200 bg-stone-50/40 p-8 text-center shadow-premium">
        <p className="mb-2 text-sm font-bold text-stone-850">All plans include</p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-stone-500">
          {['TLS-encrypted telemetry', 'JWT-secured agent keys', 'Organization data isolation', 'MongoDB Atlas persistence', 'Open-source agent'].map((item) => (
            <span key={item} className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600/80" /> {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);
