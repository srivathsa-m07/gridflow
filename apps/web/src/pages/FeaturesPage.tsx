import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Zap, BrainCircuit, Globe, Shield, Bell, GitBranch, Database, Cpu, Clock, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    icon: Zap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 ring-cyan-500/20',
    title: 'Low-overhead telemetry agents',
    desc: 'Lightweight Node.js daemons extract native OS metrics using the systeminformation library and stream them via HTTP POST every 5 seconds. No scraping, no polling, no database queries on the hot path.',
    points: ['CPU load, resident memory, system uptime', 'Alpine-based Docker image (~50MB)', 'Graceful SIGTERM/SIGINT shutdown', 'Automatic retry on network failure'],
  },
  {
    icon: BrainCircuit,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 ring-violet-500/20',
    title: 'AI-powered incident intelligence',
    desc: 'When CPU or memory exceeds 80%, GRIDFLOW calls the Gemini API asynchronously to generate a concise plain-English diagnostic. A 60-second per-agent cooldown prevents alarm fatigue.',
    points: ['Gemini 1.5 Flash model', '60-second cooldown per agent per type', 'Summaries persisted in MongoDB', 'Pushed to dashboard via Socket.IO'],
  },
  {
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 ring-emerald-500/20',
    title: 'Real-time topology visualization',
    desc: 'The infrastructure map updates in real time as agents connect, disconnect, and trigger incidents. No page refresh required.',
    points: ['Online/offline status per agent', 'Incident surface overlay', 'Last-seen timestamps', 'Organization-scoped view'],
  },
  {
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 ring-amber-500/20',
    title: 'Multi-tenant organization isolation',
    desc: 'Every organization gets a fully isolated workspace. JWT authentication ensures agents, metrics, and incidents are never shared across tenants.',
    points: ['JWT-based auth with secure key storage', 'Organization-scoped agent registry', 'Socket.IO room isolation', 'Secure agent key provisioning'],
  },
  {
    icon: Bell,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 ring-rose-500/20',
    title: 'Webhook incident notifications',
    desc: 'Route critical incidents to your team\'s communication channels the moment they trigger. Configure Discord and Slack webhooks per organization.',
    points: ['Discord webhook support', 'Slack webhook support', 'Configurable per organization', 'Triggered on incident creation'],
  },
  {
    icon: GitBranch,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 ring-sky-500/20',
    title: 'Docker-native agent deployment',
    desc: 'The GRIDFLOW agent ships as a production-ready Alpine Docker image. Deploy to any server with a single command — no Node.js, no monorepo clone required.',
    points: ['Multi-stage Alpine build', 'Environment-based configuration', 'Auto-restart support', 'Dashboard-generated deploy commands'],
  },
];

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 font-sans">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/60 bg-[#0a0f1a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/30">
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-100">GRIDFLOW</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <Link to="/login" className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">Platform features</p>
          <h1 className="text-4xl font-extrabold text-slate-50">Built for operational clarity</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Every feature in GRIDFLOW is designed to reduce time-to-insight during infrastructure incidents.
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map(({ icon: Icon, color, bg, title, desc, points }) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <div className="flex items-start gap-5">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-slate-100">{title}</h2>
                  <p className="mb-4 text-sm text-slate-400 leading-relaxed">{desc}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-300">
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

        <div className="mt-12 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
          <div className="mb-4 flex justify-center gap-6 text-slate-500">
            <Cpu className="h-5 w-5" />
            <Database className="h-5 w-5" />
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-100">Ready to deploy?</h3>
          <p className="mb-6 text-sm text-slate-400">Get your first agent streaming telemetry in under 2 minutes.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
