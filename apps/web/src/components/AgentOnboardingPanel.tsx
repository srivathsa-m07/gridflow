import React, { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, X } from 'lucide-react';
import { Card } from './ui/Card';

interface AgentOnboardingPanelProps {
  agentName: string;
  agentKey: string;
  backendUrl: string;
  onClose: () => void;
}

export const AgentOnboardingPanel: React.FC<AgentOnboardingPanelProps> = ({
  agentName,
  agentKey,
  backendUrl,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isLocalhostUrl = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');
  const slugName = agentName.toLowerCase().replace(/\s+/g, '-');

  const agentImage = 'ghcr.io/srivathsa-m07/gridflow-agent:latest';
  const dockerCommand = `docker run -d \\
  --name ${slugName} \\
  --restart=unless-stopped \\
  -e BACKEND_URL="${backendUrl}" \\
  -e PROVISIONING_TOKEN="${agentKey}" \\
  ${agentImage}`;
  const dockerSimple = `docker run -e BACKEND_URL="${backendUrl}" -e PROVISIONING_TOKEN="${agentKey}" ${agentImage}`;
  const pullCommand = `docker pull ${agentImage}`;
  const localCommand = `PROVISIONING_TOKEN="${agentKey}" BACKEND_URL="${backendUrl}" npm run dev:agent`;

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS context)
    }
  };

  const renderCopyButton = (value: string, field: string) => {
    const active = copiedField === field;
    return (
      <button
        onClick={() => copyToClipboard(value, field)}
        type="button"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          padding: '10px 14px',
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(31,109,74,0.2)'}`,
          background: active ? 'rgba(16,185,129,0.12)' : 'rgba(31,109,74,0.1)',
          color: active ? 'var(--ok)' : 'var(--accent-blue)',
          cursor: 'pointer',
        }}
      >
        {active ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
      </button>
    );
  };

  return (
    <Card variant="dark" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 420px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--ok)' }}>
            <CheckCircle2 size={18} />
            Agent provisioned
          </div>
          <h2 style={{ margin: '14px 0 10px', fontSize: 22, fontWeight: 700, color: 'var(--d-text)' }}>Deploy your agent</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--d-text-2)', maxWidth: 720 }}>Your agent <strong style={{ color: 'var(--d-text)' }}>{agentName}</strong> is configured and ready to connect. Choose your deployment method below.</p>
        </div>
        <button
          onClick={onClose}
          type="button"
          style={{
            border: '1px solid var(--d-border)',
            borderRadius: 999,
            background: 'var(--d-overlay)',
            color: 'var(--d-text-2)',
            padding: 10,
            cursor: 'pointer',
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      {isLocalhostUrl && (
        <div style={{ marginBottom: 20, padding: 18, borderRadius: 18, border: '1px solid rgba(217,119,6,0.18)', background: 'rgba(217,119,6,0.08)', color: 'var(--warn)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} />
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}><strong>Backend URL is set to localhost.</strong> The Docker commands below will only work on this machine. For remote agents, set <code style={{ color: 'var(--warn)' }}>VITE_API_URL</code> to your deployed API URL and redeploy the dashboard.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 20 }}>
        <Card variant="darkOverlay" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--d-text-3)' }}>Agent key</span>
            {renderCopyButton(agentKey, 'key')}
          </div>
          <div style={{ background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 16, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', wordBreak: 'break-all' }}>
            {agentKey}
          </div>
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--d-text-3)' }}>This is a one-time provisioning token — the agent exchanges it for its permanent credential on first startup. It expires after a short window and cannot be reused, so keep it secure and do not commit it to source control.</p>
        </Card>

        {/* The production path (one command, auto-pulls the image) is the
            visually dominant option — everything else is a secondary,
            collapsed "advanced" path so a first-time user sees exactly one
            obvious next step. */}
        <Card variant="darkOverlay" style={{ padding: 20, border: '1px solid rgba(31,109,74,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ok)', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px' }}>Recommended</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--d-text)' }}>Deploy with Docker</p>
          </div>
          <p style={{ margin: 0, marginBottom: 16, fontSize: 12, color: 'var(--d-text-2)' }}>
            One command — no Node.js, no source checkout. The published image is pulled automatically from GitHub Container Registry on first run.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-2)', fontWeight: 600 }}>Run as a background service</p>
            {renderCopyButton(dockerCommand, 'primary')}
          </div>
          <pre style={{ margin: 0, borderRadius: 16, background: 'var(--d-bg)', border: '1px solid var(--d-border)', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <code>{dockerCommand}</code>
          </pre>
        </Card>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--d-text-3)', userSelect: 'none' }}>
            Advanced installation options
          </summary>
          <div style={{ display: 'grid', gap: 20, marginTop: 16 }}>
            <Card variant="darkOverlay" style={{ padding: 20 }}>
              <p style={{ margin: 0, marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--d-text-3)' }}>Docker, step by step</p>
              <div style={{ display: 'grid', gap: 20 }}>
                {[
                  { label: 'Step 1', title: 'Pull the published agent image', command: pullCommand },
                  { label: 'Step 2', title: 'Run quick start (foreground)', command: dockerSimple },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-2)', fontWeight: 600 }}><span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{item.label}</span> {item.title}</p>
                      {renderCopyButton(item.command, item.label)}
                    </div>
                    <pre style={{ margin: 0, borderRadius: 16, background: 'var(--d-bg)', border: '1px solid var(--d-border)', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                      <code>{item.command}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="darkOverlay" style={{ padding: 20 }}>
              <p style={{ margin: 0, marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--d-text-3)' }}>Local development</p>
              <p style={{ margin: 0, marginBottom: 18, fontSize: 12, color: 'var(--d-text-2)' }}>Run the agent from source. Requires Node.js 18+ and <code style={{ color: 'var(--d-text-2)' }}>npm install</code> from the monorepo root.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-2)', fontWeight: 600 }}>Set env vars and start</p>
                {renderCopyButton(localCommand, 'local')}
              </div>
              <pre style={{ margin: 0, borderRadius: 16, background: 'var(--d-bg)', border: '1px solid var(--d-border)', padding: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                <code>{localCommand}</code>
              </pre>
            </Card>
          </div>
        </details>

        <Card variant="darkOverlay" style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--d-text-3)', marginBottom: 12 }}>What happens next</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--d-text-2)', fontSize: 13, lineHeight: 1.7 }}>
            <li>✓ Agent starts streaming telemetry every 5 seconds.</li>
            <li>✓ It appears as <strong style={{ color: 'var(--d-text)' }}>online</strong> in the Topology and Infrastructure views.</li>
            <li>✓ Incidents trigger automatically when CPU or memory exceeds 80%.</li>
            <li>✓ Configure webhook notifications in the settings panel.</li>
          </ul>
        </Card>
      </div>
    </Card>
  );
};
