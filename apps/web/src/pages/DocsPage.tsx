import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Terminal } from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const SECTIONS = [
  { id: 'quickstart', title: 'Quick start', content: [
      { type: 'heading', text: 'Prerequisites' },
      { type: 'list', items: ['Node.js v18+', 'npm v9+', 'MongoDB Atlas cluster', 'Gemini API key (optional)'] },
      { type: 'heading', text: '1. Clone and install' },
      { type: 'code', text: 'git clone https://github.com/your-org/gridflow\ncd gridflow\nnpm install' },
      { type: 'heading', text: '2. Configure environment' },
      { type: 'text', text: 'Create apps/api/.env:' },
      { type: 'code', text: 'PORT=3001\nMONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gridflow\nGEMINI_API_KEY=AIzaSy...\nNODE_ENV=development' },
      { type: 'heading', text: '3. Start the stack' },
      { type: 'code', text: 'npm run dev:api    # Telemetry gateway\nnpm run dev:web    # Operations console\nnpm run dev:agent  # Telemetry agent' },
    ]},
  { id: 'docker', title: 'Docker deployment', content: [
      { type: 'heading', text: 'Full stack via Docker Compose' },
      { type: 'text', text: 'Copy .env.example to .env and configure your MongoDB URI and Gemini key, then:' },
      { type: 'code', text: 'cp .env.example .env\ndocker compose up --build' },
      { type: 'text', text: 'Dashboard: http://localhost:3000 · API: http://localhost:3001' },
      { type: 'heading', text: 'Deploy a standalone agent' },
      { type: 'code', text: 'docker build -f apps/agent/Dockerfile -t gridflow-agent:latest .\ndocker run -d --name my-agent --restart=unless-stopped -e BACKEND_URL="https://your-api.onrender.com" -e AGENT_KEY="<your-key>" gridflow-agent:latest' },
    ]},
  { id: 'agents', title: 'Agent provisioning', content: [
      { type: 'heading', text: 'Creating an agent' },
      { type: 'list', items: ['Sign in to the dashboard', 'Click New Agent', 'Enter a name like prod-web-01', 'Copy the AGENT_KEY shown once'] },
      { type: 'heading', text: 'Agent environment variables' },
      { type: 'table', rows: [['BACKEND_URL', 'Required', 'Your GRIDFLOW API URL'], ['AGENT_KEY', 'Required', 'Key generated during provisioning']] },
      { type: 'heading', text: 'Agent logs' },
      { type: 'code', text: 'docker logs -f my-agent\n\n[STARTUP] ✓ Agent initialized on hostname: prod-web-01\n[STARTUP] ✓ Backend gateway: https://your-api.onrender.com\n[TELEMETRY] ✓ Metrics sent (CPU: 34.2%, Memory: 58.1%)' },
    ]},
  { id: 'notifications', title: 'Notifications', content: [
      { type: 'heading', text: 'Webhook configuration' },
      { type: 'text', text: 'Navigate to Notifications and enter your webhook URLs.' },
      { type: 'list', items: ['Discord webhook URL', 'Slack webhook URL'] },
      { type: 'heading', text: 'When notifications fire' },
      { type: 'list', items: ['CPU exceeds threshold', 'Memory exceeds threshold', '60-second cooldown reduces duplicates'] },
    ]},
];

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="darkOverlay" style={{ position: 'relative', margin: '20px 0', padding: 22 }}>
      <button onClick={copy} type="button" style={{ position: 'absolute', right: 18, top: 18, borderRadius: 10, border: '1px solid var(--d-border)', background: 'var(--d-raised)', color: 'var(--d-text-2)', padding: '8px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        {copied ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
      </button>
      <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{text}</pre>
    </Card>
  );
};

export const DocsPage: React.FC = () => {
  const [active, setActive] = useState('quickstart');
  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <MarketingShell>
      <section style={{ padding: '88px 0 64px' }}>
        <div style={{ display: 'grid', gap: 28, gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
          <aside style={{ display: 'grid', gap: 18 }}>
            <Card style={{ padding: 22, position: 'sticky', top: 92 }}>
              <p style={{ margin: 0, marginBottom: 18, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Documentation</p>
              <nav style={{ display: 'grid', gap: 10 }}>
                {SECTIONS.map((s) => {
                  const activeItem = active === s.id;
                  return (
                    <button key={s.id} type="button" onClick={() => setActive(s.id)} style={{ width: '100%', textAlign: 'left', borderRadius: 14, border: 'none', background: activeItem ? 'rgba(31,109,74,0.12)' : 'transparent', color: activeItem ? 'var(--accent-blue)' : 'var(--text-3)', padding: '12px 14px', cursor: 'pointer' }}>
                      {s.title}
                    </button>
                  );
                })}
              </nav>
              <div style={{ marginTop: 24, padding: 18, borderRadius: 18, background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'var(--text-3)' }}>
                  <Terminal size={16} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Ready to deploy?</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>Create your free account and begin monitoring.</p>
                <Button asLink href="/login" variant="blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 12 }}>
                  Get started <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </aside>

          <main style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, marginBottom: 28, fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 600, color: 'var(--text)' }}>Documentation</h1>
            <div style={{ display: 'grid', gap: 22 }}>
              {section.content.map((block, index) => {
                if (block.type === 'heading') {
                  return (
                    <h2 key={index} style={{ margin: '32px 0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{block.text}</h2>
                  );
                }
                if (block.type === 'text') {
                  return <p key={index} style={{ margin: 0, color: 'var(--text-3)', lineHeight: 1.8, fontSize: 14 }}>{block.text}</p>;
                }
                if (block.type === 'code') {
                  return <CodeBlock key={index} text={block.text!} />;
                }
                if (block.type === 'list') {
                  return (
                    <ul key={index} style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 10, color: 'var(--text-3)', fontSize: 14 }}>
                      {block.items!.map((item) => (
                        <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'table') {
                  return (
                    <div key={index} style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <tr>
                            {['Variable', 'Required', 'Description'].map((header) => (
                              <th key={header} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows!.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ background: rowIndex % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} style={{ padding: '14px 16px', color: cellIndex === 0 ? 'var(--accent-blue)' : 'var(--text-3)', fontFamily: cellIndex === 0 ? 'var(--font-mono)' : 'inherit', fontSize: cellIndex === 0 ? 12 : 14 }}>{cell}</td>
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

            <div style={{ marginTop: 32, display: 'grid', gap: 12 }}>
              {SECTIONS.map((s) => {
                const activeItem = active === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => setActive(s.id)} style={{ borderRadius: 14, border: activeItem ? '1px solid rgba(31,109,74,0.35)' : '1px solid var(--border)', background: activeItem ? 'rgba(31,109,74,0.12)' : 'transparent', color: activeItem ? 'var(--accent-blue)' : 'var(--text-3)', padding: '12px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                    {s.title}
                  </button>
                );
              })}
            </div>
          </main>
        </div>
      </section>
    </MarketingShell>
  );
};
