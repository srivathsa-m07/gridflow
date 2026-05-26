import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Copy, Check, Terminal, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quick start',
    content: [
      { type: 'heading', text: 'Prerequisites' },
      { type: 'list', items: ['Node.js v18+', 'npm v9+', 'MongoDB Atlas cluster', 'Gemini API key (optional)'] },
      { type: 'heading', text: '1. Clone and install' },
      { type: 'code', text: 'git clone https://github.com/your-org/gridflow\ncd gridflow\nnpm install' },
      { type: 'heading', text: '2. Configure environment' },
      { type: 'text', text: 'Create apps/api/.env:' },
      { type: 'code', text: 'PORT=3001\nMONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gridflow\nGEMINI_API_KEY=AIzaSy...\nNODE_ENV=development' },
      { type: 'heading', text: '3. Start the stack' },
      { type: 'code', text: 'npm run dev:api    # Telemetry gateway\nnpm run dev:web    # Operations console\nnpm run dev:agent  # Telemetry agent' },
    ],
  },
  {
    id: 'docker',
    title: 'Docker deployment',
    content: [
      { type: 'heading', text: 'Full stack via Docker Compose' },
      { type: 'text', text: 'Copy .env.example to .env and configure your MongoDB URI and Gemini key, then:' },
      { type: 'code', text: 'cp .env.example .env\ndocker compose up --build' },
      { type: 'text', text: 'Dashboard: http://localhost:3000 · API: http://localhost:3001' },
      { type: 'heading', text: 'Deploy a standalone agent' },
      { type: 'text', text: 'Build the agent image once from the monorepo root:' },
      { type: 'code', text: 'docker build -f apps/agent/Dockerfile -t gridflow-agent:latest .' },
      { type: 'text', text: 'Then run on any server (get your AGENT_KEY from the dashboard):' },
      { type: 'code', text: 'docker run -d \\\n  --name my-agent \\\n  --restart=unless-stopped \\\n  -e BACKEND_URL="https://your-api.onrender.com" \\\n  -e AGENT_KEY="<your-key>" \\\n  gridflow-agent:latest' },
    ],
  },
  {
    id: 'agents',
    title: 'Agent provisioning',
    content: [
      { type: 'heading', text: 'Creating an agent' },
      { type: 'list', items: ['Sign in to your GRIDFLOW dashboard', 'Click New Agent in the top bar', 'Enter a name (e.g. prod-web-01)', 'Copy the generated AGENT_KEY — it is shown only once'] },
      { type: 'heading', text: 'Agent environment variables' },
      { type: 'table', rows: [['BACKEND_URL', 'Required', 'Your GRIDFLOW API URL'], ['AGENT_KEY', 'Required', 'Key generated during provisioning']] },
      { type: 'heading', text: 'Agent logs' },
      { type: 'code', text: 'docker logs -f my-agent\n\n[STARTUP] ✓ Agent initialized on hostname: prod-web-01\n[STARTUP] ✓ Backend gateway: https://your-api.onrender.com\n[STARTUP] ✓ Telemetry interval: 5 seconds\n[TELEMETRY] ✓ Metrics sent (CPU: 34.2%, Memory: 58.1%)' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    content: [
      { type: 'heading', text: 'Webhook configuration' },
      { type: 'text', text: 'Navigate to the Notifications section in the dashboard and enter your webhook URLs.' },
      { type: 'list', items: ['Discord: Settings > Integrations > Webhooks > Copy Webhook URL', 'Slack: Apps > Incoming Webhooks > Add to Slack > Copy URL'] },
      { type: 'heading', text: 'When notifications fire' },
      { type: 'list', items: ['CPU exceeds 80% threshold', 'Memory exceeds 80% threshold', 'Per-agent 60-second cooldown prevents spam'] },
    ],
  },
];

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="group relative my-4 rounded-xl border border-stone-800 bg-stone-950 overflow-hidden">
      <button
        onClick={copy}
        className="absolute right-3 top-3 rounded-md border border-stone-800 bg-stone-900 p-1.5 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stone-200"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-450" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-xs text-stone-300 leading-relaxed">{text}</pre>
    </div>
  );
};

export const DocsPage: React.FC = () => {
  const [active, setActive] = useState('quickstart');

  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-stone-800 font-sans">
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

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden w-48 shrink-0 pt-8 lg:block">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Documentation</p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active === s.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-stone-605 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50/50 p-4 shadow-premium">
              <Terminal className="mb-2 h-4 w-4 text-stone-450" />
              <p className="text-xs font-semibold text-stone-800">Ready to deploy?</p>
              <p className="mt-1 text-xs text-stone-500">Create your free account and start monitoring.</p>
              <Link
                to="/login"
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Get started <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 pt-8">
            <h1 className="mb-8 text-2xl font-bold text-stone-900">{section.title}</h1>
            <div className="space-y-2">
              {section.content.map((block, i) => {
                if (block.type === 'heading') {
                  return <h2 key={i} className="mt-6 mb-2 text-base font-bold text-stone-850">{block.text}</h2>;
                }
                if (block.type === 'text') {
                  return <p key={i} className="text-sm text-stone-600 leading-relaxed">{block.text}</p>;
                }
                if (block.type === 'code') {
                  return <CodeBlock key={i} text={block.text!} />;
                }
                if (block.type === 'list') {
                  return (
                    <ul key={i} className="space-y-1.5 pl-1">
                      {block.items!.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-stone-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'table') {
                  return (
                    <div key={i} className="my-4 overflow-hidden rounded-xl border border-stone-200 shadow-premium bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-200 bg-stone-50">
                            {['Variable', 'Required', 'Description'].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-stone-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows!.map((row, ri) => (
                            <tr key={ri} className="border-b border-stone-100">
                              {row.map((cell, ci) => (
                                <td key={ci} className={`px-4 py-3 ${ci === 0 ? 'font-mono text-xs text-indigo-600 font-bold' : 'text-stone-605 text-sm'}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Mobile section nav */}
            <div className="mt-10 flex flex-wrap gap-2 lg:hidden">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active === s.id ? 'bg-indigo-50 text-indigo-700' : 'border border-stone-200 bg-white text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
