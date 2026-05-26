import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BrainCircuit,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  Terminal,
  BarChart3,
  Bell,
  GitBranch,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features',     href: '/features' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Docs',         href: '/docs' },
  { label: 'Pricing',      href: '/pricing' },
];

const FEATURES = [
  {
    icon: Zap,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 ring-indigo-100/50',
    title: 'Sub-second telemetry',
    desc: 'Agents stream CPU, memory, and uptime every 5 seconds via lightweight HTTP. No scraping intervals, no polling overhead.',
  },
  {
    icon: BrainCircuit,
    color: 'text-violet-600',
    bg: 'bg-violet-50 ring-violet-100/50',
    title: 'AI incident intelligence',
    desc: 'When thresholds breach, Gemini generates plain-English diagnostic summaries — so you know why, not just what.',
  },
  {
    icon: Globe,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 ring-emerald-100/50',
    title: 'Real-time topology',
    desc: 'Visualize your entire infrastructure as a live map. Online, offline, and incident-active nodes update instantly.',
  },
  {
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-50 ring-amber-100/50',
    title: 'Organization isolation',
    desc: 'Multi-tenant architecture with JWT auth. Each organization sees only its own agents, metrics, and incidents.',
  },
  {
    icon: Bell,
    color: 'text-rose-600',
    bg: 'bg-rose-50 ring-rose-100/50',
    title: 'Webhook notifications',
    desc: 'Route critical incidents to Discord or Slack the moment they trigger. Configurable per organization.',
  },
  {
    icon: GitBranch,
    color: 'text-blue-600',
    bg: 'bg-blue-50 ring-blue-100/50',
    title: 'Docker-native agents',
    desc: 'Deploy monitoring agents to any server in seconds with a single docker run command. No Node.js required.',
  },
];

const STEPS = [
  { n: '01', title: 'Create your organization', desc: 'Sign up and get an isolated workspace in under 30 seconds.' },
  { n: '02', title: 'Provision an agent', desc: 'Click New Agent, name it, and copy your generated AGENT_KEY.' },
  { n: '03', title: 'Deploy via Docker', desc: 'Run one docker command on any server. The agent connects immediately.' },
  { n: '04', title: 'Monitor in real time', desc: 'Watch metrics, topology, and AI-powered incidents live on the dashboard.' },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbfcfa] text-stone-800 font-sans">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-[#fbfcfa]/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
              <Activity className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm font-bold tracking-tight text-stone-900">GRIDFLOW</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm font-medium text-stone-600 hover:text-indigo-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-stone-600 hover:text-indigo-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid pt-32 pb-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Real-time infrastructure observability
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-stone-900 md:text-6xl">
            Monitor your infrastructure.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Understand every incident.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed">
            GRIDFLOW is a lightweight observability platform that streams live telemetry from your servers,
            detects anomalies, and uses AI to explain what went wrong — before your users notice.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-premium"
            >
              Start monitoring free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/docs"
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition"
            >
              <Terminal className="h-4 w-4" />
              View docs
            </Link>
          </div>
        </div>

        {/* Hero terminal mockup (balanced dark contrast highlight) */}
        <div className="mx-auto mt-16 max-w-3xl px-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-950/95 shadow-premium-lg overflow-hidden">
            <div className="flex items-center gap-2 border-b border-stone-900 bg-stone-950/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-stone-500 font-mono">gridflow-agent — terminal</span>
            </div>
            <div className="p-5 font-mono text-xs leading-relaxed text-stone-300 space-y-1">
              <p><span className="text-stone-500">$</span> <span className="text-indigo-400">docker run</span> -e BACKEND_URL="https://gridflow-api.onrender.com" -e AGENT_KEY="gf_..." gridflow-agent:latest</p>
              <p className="text-emerald-400">[STARTUP] ✓ Agent initialized on hostname: prod-web-01</p>
              <p className="text-emerald-400">[STARTUP] ✓ Backend gateway: https://gridflow-api.onrender.com</p>
              <p className="text-emerald-400">[STARTUP] ✓ Telemetry interval: 5 seconds</p>
              <p className="text-stone-400">[TELEMETRY] ✓ Metrics sent <span className="text-indigo-300">(CPU: 34.2%, Memory: 58.1%)</span></p>
              <p className="text-stone-400">[TELEMETRY] ✓ Metrics sent <span className="text-indigo-300">(CPU: 36.8%, Memory: 58.4%)</span></p>
              <p className="text-amber-400">[INCIDENT]  ⚠ HIGH_CPU threshold breached — AI summary generated</p>
              <p className="text-stone-500 italic">"System may be undergoing heavy thread pool execution or process leaks."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="border-y border-stone-200/60 bg-stone-50/50 py-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-stone-500 uppercase tracking-widest">
            <span>Real-time Socket.IO</span>
            <span className="text-stone-300">·</span>
            <span>MongoDB Atlas</span>
            <span className="text-stone-300">·</span>
            <span>Gemini AI</span>
            <span className="text-stone-300">·</span>
            <span>Docker-native</span>
            <span className="text-stone-300">·</span>
            <span>Multi-tenant</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-24 bg-[#fcfbf9]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Platform capabilities</p>
            <h2 className="text-3xl font-bold text-stone-900">Everything you need to stay operational</h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Built for teams that need observability without the complexity of a full Prometheus/Grafana stack.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-stone-200/80 bg-white p-6 hover:border-stone-300 hover:shadow-premium transition-all duration-300"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-stone-900">{title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI section */}
      <section className="py-24 bg-gradient-to-b from-[#fcfbf9] via-violet-50/20 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-600">Incident intelligence</p>
              <h2 className="text-3xl font-bold text-stone-900 leading-snug">
                AI explains your incidents.<br />Not just alerts.
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                When CPU or memory breaches safe thresholds, GRIDFLOW doesn't just fire an alert.
                It calls the Gemini API and generates a concise, plain-English diagnostic summary
                explaining the likely cause — so your team can act immediately.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  '60-second cooldown prevents alarm fatigue',
                  'Summaries persisted alongside incident records',
                  'Pushed to dashboard in real time via Socket.IO',
                  'Routed to Discord or Slack via webhooks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-premium-lg">
              <div className="mb-4 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-violet-600" />
                <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">AI Incident Analyst</span>
              </div>
              <div className="space-y-4">
                {[
                  { agent: 'prod-web-01', type: 'HIGH_CPU', cpu: '94%', summary: 'System may be undergoing heavy thread pool execution or process leaks due to sustained high CPU load.' },
                  { agent: 'db-replica-02', type: 'HIGH_MEMORY', cpu: '91%', summary: 'Elevated memory pressure suggests a potential memory leak or large dataset being held in application cache.' },
                ].map((inc) => (
                  <div key={inc.agent} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">{inc.agent}</span>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 ring-1 ring-rose-200/50">
                        {inc.type}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 italic leading-relaxed">"{inc.summary}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Onboarding</p>
            <h2 className="text-3xl font-bold text-stone-900">Up and running in 4 steps</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-premium">
                <span className="mb-4 block font-mono text-2xl font-bold text-indigo-100">{n}</span>
                <h3 className="mb-2 text-sm font-semibold text-stone-900">{title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics preview */}
      <section className="py-24 bg-[#fcfbf9] border-t border-stone-200/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active Agents', value: '12', unit: 'online', color: 'text-indigo-600', bar: 'from-indigo-500 to-indigo-600' },
                  { label: 'Avg CPU Load', value: '34', unit: '%', color: 'text-emerald-600', bar: 'from-emerald-500 to-teal-500' },
                  { label: 'Active Incidents', value: '2', unit: 'open', color: 'text-rose-600', bar: 'from-rose-500 to-rose-600' },
                  { label: 'Avg Memory', value: '61', unit: '%', color: 'text-violet-600', bar: 'from-violet-500 to-violet-600' },
                ].map(({ label, value, unit, color, bar }) => (
                  <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-premium">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-black ${color}`}>{value}</span>
                      <span className="text-sm text-stone-400 font-medium">{unit}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full bg-gradient-to-r ${bar} rounded-full`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">Live dashboard</p>
              <h2 className="text-3xl font-bold text-stone-900 leading-snug">
                Your entire infrastructure.<br />One operational console.
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                The GRIDFLOW operations console gives you a real-time view of every agent, metric, and incident
                across your organization — without querying a database or refreshing a page.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-premium"
              >
                <BarChart3 className="h-4 w-4" />
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-3xl border border-stone-200 bg-stone-50/50 p-12 shadow-premium-lg">
            <h2 className="text-3xl font-bold text-stone-900">
              Start monitoring your infrastructure today.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-stone-600">
              Free to use. No credit card required. Deploy your first agent in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-premium"
              >
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/docs"
                className="flex items-center gap-2 rounded-xl border border-stone-200 px-8 py-3 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                  <Activity className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-bold text-stone-900">GRIDFLOW</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Real-time infrastructure observability for teams that move fast.
              </p>
              <p className="mt-4 text-[10px] text-stone-400">Built with React, Express, Socket.IO &amp; Gemini AI</p>
            </div>
            {/* Product */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Product</p>
              <ul className="space-y-2">
                {[{ label: 'Features', href: '/features' }, { label: 'Architecture', href: '/architecture' }, { label: 'Pricing', href: '/pricing' }, { label: 'Docs', href: '/docs' }].map(l => (
                  <li key={l.href}><Link to={l.href} className="text-xs text-stone-600 hover:text-indigo-600 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            {/* Platform */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Platform</p>
              <ul className="space-y-2 text-xs text-stone-500">
                {['Real-time telemetry', 'AI incident summaries', 'Docker-native agents', 'Multi-tenant isolation'].map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Trust */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Security</p>
              <ul className="space-y-2 text-xs text-stone-500">
                {['TLS-encrypted transport', 'JWT-secured agent keys', 'Organization isolation', 'MongoDB Atlas storage'].map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row">
            <p className="text-[10px] text-stone-400">© {new Date().getFullYear()} GRIDFLOW. All rights reserved.</p>
            <div className="flex items-center gap-5 text-[10px] text-stone-400">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <Link to="/login" className="hover:text-stone-600 transition-colors">Sign in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

