import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, Server, Database, Zap, BrainCircuit, Globe } from 'lucide-react';

const PIPELINE = [
  { step: '01', icon: Server, color: 'text-cyan-400', title: 'Extraction', desc: 'The telemetry agent uses systeminformation to collect CPU load, resident memory %, and system uptime every 5 seconds.' },
  { step: '02', icon: Zap, color: 'text-amber-400', title: 'Ingestion & validation', desc: 'The gateway receives payloads via HTTP POST /api/agent/metrics, validates ranges (CPU 0–100%), and authenticates via AGENT_KEY.' },
  { step: '03', icon: Globe, color: 'text-emerald-400', title: 'Registry enrichment', desc: 'The agent registry updates the agent\'s status (healthy/warning/critical), lastSeen timestamp, and isOnline flag.' },
  { step: '04', icon: BrainCircuit, color: 'text-violet-400', title: 'Incident & AI processing', desc: 'If thresholds breach, the incident engine checks cooldowns, calls Gemini API, and persists the incident with its AI summary.' },
  { step: '05', icon: Activity, color: 'text-cyan-400', title: 'Real-time broadcast', desc: 'Metric updates, alerts, and incidents are pushed to all connected dashboards via Socket.IO — no polling required.' },
  { step: '06', icon: Database, color: 'text-slate-400', title: 'Long-term storage', desc: 'Telemetry records and incidents are persisted in MongoDB Atlas for historical queries and incident review.' },
];

const STACK = [
  { layer: 'Agent', tech: 'Node.js + TypeScript', detail: 'systeminformation, dotenv, fetch' },
  { layer: 'Gateway', tech: 'Express + Socket.IO', detail: 'Mongoose, JWT, Gemini API' },
  { layer: 'Database', tech: 'MongoDB Atlas', detail: 'Metrics, Incidents, Agents, Settings' },
  { layer: 'Dashboard', tech: 'React + Vite', detail: 'Tailwind CSS, Recharts, Socket.IO client' },
  { layer: 'AI Engine', tech: 'Gemini 1.5 Flash', detail: 'Async incident summarization' },
  { layer: 'Deployment', tech: 'Docker + Render + Vercel', detail: 'Multi-stage Alpine builds' },
];

export const ArchitecturePage: React.FC = () => {
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">System design</p>
          <h1 className="text-4xl font-extrabold text-slate-50">Architecture overview</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            GRIDFLOW uses a decoupled push-based architecture to separate collection, ingestion, and presentation.
          </p>
        </div>

        {/* Pipeline */}
        <div className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-slate-200">Telemetry pipeline</h2>
          <div className="space-y-3">
            {PIPELINE.map(({ step, icon: Icon, color, title, desc }, i) => (
              <div key={step} className="flex items-start gap-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 ring-1 ring-slate-800`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  {i < PIPELINE.length - 1 && <div className="h-4 w-px bg-slate-800" />}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-600">{step}</span>
                    <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-slate-200">Technology stack</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Layer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Technology</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {STACK.map(({ layer, tech, detail }, i) => (
                  <tr key={layer} className={`border-b border-slate-800/60 ${i % 2 === 0 ? 'bg-slate-950/30' : ''}`}>
                    <td className="px-5 py-3.5 font-semibold text-slate-200">{layer}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-cyan-300">{tech}</td>
                    <td className="px-5 py-3.5 text-slate-400">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monorepo */}
        <div className="mb-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Monorepo structure</h2>
          <pre className="font-mono text-xs text-slate-400 leading-relaxed overflow-x-auto">{`gridflow/
├── apps/
│   ├── agent/          # Telemetry daemon (Node.js)
│   ├── api/            # Telemetry gateway (Express + Socket.IO)
│   └── web/            # Operations console (React + Vite)
├── packages/           # Shared workspace packages
├── docker-compose.yml  # Full-stack local deployment
└── tsconfig.base.json  # Shared TypeScript config`}</pre>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-slate-100">See it in action</h3>
          <p className="mb-6 text-sm text-slate-400">Deploy your first agent and watch the pipeline in real time.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
