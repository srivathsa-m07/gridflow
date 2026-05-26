import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Zap, BrainCircuit, Globe, Shield, Bell, GitBranch, Database, Cpu, Clock, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    icon: Zap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 ring-indigo-100/50',
    title: 'Low-overhead telemetry agents',
    desc: 'Lightweight Node.js daemons extract native OS metrics using the systeminformation library and stream them via HTTP POST every 5 seconds. No scraping, no polling, no database queries on the hot path.',
    points: ['CPU load, resident memory, system uptime', 'Alpine-based Docker image (~50MB)', 'Graceful SIGTERM/SIGINT shutdown', 'Automatic retry on network failure'],
  },
  {
    icon: BrainCircuit,
    color: 'text-violet-600',
    bg: 'bg-violet-50 ring-violet-100/50',
    title: 'AI-powered incident intelligence',
    desc: 'When CPU or memory exceeds 80%, GRIDFLOW calls the Gemini API asynchronously to generate a concise plain-English diagnostic. A 60-second per-agent cooldown prevents alarm fatigue.',
    points: ['Gemini 1.5 Flash model', '60-second cooldown per agent per type', 'Summaries persisted in MongoDB', 'Pushed to dashboard via Socket.IO'],
  },
  {
    icon: Globe,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 ring-emerald-100/50',
    title: 'Real-time topology visualization',
    desc: 'The infrastructure map updates in real time as agents connect, disconnect, and trigger incidents. No page refresh required.',
    points: ['Online/offline status per agent', 'Incident surface overlay', 'Last-seen timestamps', 'Organization-scoped view'],
  },
  {
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-50 ring-amber-100/50',
    title: 'Multi-tenant organization data isolation',
    desc: 'Every organization gets a fully isolated workspace. JWT authentication ensures agents, metrics, and incidents are never shared across tenants.',
    points: ['JWT-based auth with secure key storage', 'Organization-scoped agent registry', 'Socket.IO room isolation', 'Secure agent key provisioning'],
  },
  {
    icon: Bell,
    color: 'text-rose-600',
    bg: 'bg-rose-50 ring-rose-100/50',
    title: 'Webhook incident notifications',
    desc: 'Route critical incidents to your team\'s communication channels the moment they trigger. Configure Discord and Slack webhooks per organization.',
    points: ['Discord webhook support', 'Slack webhook support', 'Configurable per organization', 'Triggered on incident creation'],
  },
  {
    icon: GitBranch,
    color: 'text-blue-600',
    bg: 'bg-blue-50 ring-blue-100/50',
    title: 'Docker-native agent deployment',
    desc: 'The GRIDFLOW agent ships as a production-ready Alpine Docker image. Deploy to any server with a single command — no Node.js, no monorepo clone required.',
    points: ['Multi-stage Alpine build', 'Environment-based configuration', 'Auto-restart support', 'Dashboard-generated deploy commands'],
  },
];

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbfcfa] text-stone-850 font-sans">
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

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Platform features</p>
          <h1 className="text-4xl font-extrabold text-stone-900">Built for operational clarity</h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Every feature in GRIDFLOW is designed to reduce time-to-insight during infrastructure incidents.
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map(({ icon: Icon, color, bg, title, desc, points }) => (
            <div key={title} className="rounded-2xl border border-stone-200 bg-white p-8 shadow-premium">
              <div className="flex items-start gap-5">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-bold text-stone-900">{title}</h2>
                  <p className="mb-4 text-sm text-stone-600 leading-relaxed">{desc}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-stone-700">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color.replace('text-', 'bg-')}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-stone-200 bg-stone-50/50 p-8 text-center shadow-premium">
          <div className="mb-4 flex justify-center gap-6 text-stone-400">
            <Cpu className="h-5 w-5" />
            <Database className="h-5 w-5" />
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-stone-900">Ready to deploy?</h3>
          <p className="mb-6 text-sm text-stone-600">Get your first agent streaming telemetry in under 2 minutes.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-premium"
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
