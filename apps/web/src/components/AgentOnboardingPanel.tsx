import React, { useState } from 'react';
import { CheckCircle2, X, Copy, Check, AlertTriangle } from 'lucide-react';

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
  onClose
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isLocalhostUrl = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');
  const slugName = agentName.toLowerCase().replace(/\s+/g, '-');

  const dockerCommand = `docker run -d \\
  --name ${slugName} \\
  --restart=unless-stopped \\
  -e BACKEND_URL="${backendUrl}" \\
  -e AGENT_KEY="${agentKey}" \\
  gridflow-agent:latest`;

  const dockerSimple = `docker run -e BACKEND_URL="${backendUrl}" -e AGENT_KEY="${agentKey}" gridflow-agent:latest`;

  const buildCommand = `docker build -f apps/agent/Dockerfile -t gridflow-agent:latest .`;

  const localCommand = `AGENT_KEY="${agentKey}" BACKEND_URL="${backendUrl}" npm run dev:agent`;

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS context)
    }
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(value, field)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        copiedField === field
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20'
      }`}
    >
      {copiedField === field ? (
        <><Check className="w-3 h-3" />Copied</>
      ) : (
        <><Copy className="w-3 h-3" />Copy</>
      )}
    </button>
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 font-semibold uppercase tracking-[0.24em] mb-2">
            <CheckCircle2 className="w-5 h-5" />
            Agent Provisioned
          </div>
          <h2 className="text-2xl font-bold text-white">Deploy your agent</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Your agent <strong className="text-slate-200">{agentName}</strong> is configured and ready to connect. Choose your deployment method below.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 transition"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLocalhostUrl && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
          <span>
            <strong>Backend URL is set to localhost.</strong> The Docker commands below will only work on this machine.
            For remote agents, set <code className="text-amber-300">VITE_API_URL</code> to your deployed API URL (e.g.{' '}
            <code className="text-amber-300">https://gridflow-api.onrender.com</code>) and redeploy the dashboard.
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* Agent Key */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">Agent Key</p>
            <CopyButton value={agentKey} field="key" />
          </div>
          <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 break-all border border-slate-800">
            {agentKey}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This key authenticates your agent with GRIDFLOW. Keep it secret — never commit it to version control.
          </p>
        </div>

        {/* Docker Deployment */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold mb-1">Docker Deployment</p>
          <p className="text-xs text-slate-500 mb-4">
            Run the agent as a container on any server with Docker installed. No Node.js required.
          </p>

          <div className="space-y-4">
            {/* Step 1: Build */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">
                  <span className="text-cyan-400 font-bold mr-1">Step 1</span> Build the agent image (from monorepo root)
                </p>
                <CopyButton value={buildCommand} field="build" />
              </div>
              <pre className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800">
                <code>{buildCommand}</code>
              </pre>
            </div>

            {/* Step 2: Run (quick) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">
                  <span className="text-cyan-400 font-bold mr-1">Step 2a</span> Quick start (foreground)
                </p>
                <CopyButton value={dockerSimple} field="docker-simple" />
              </div>
              <pre className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800">
                <code>{dockerSimple}</code>
              </pre>
            </div>

            {/* Step 2: Run (production) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">
                  <span className="text-cyan-400 font-bold mr-1">Step 2b</span> Production (daemon + auto-restart)
                </p>
                <CopyButton value={dockerCommand} field="docker-full" />
              </div>
              <pre className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 whitespace-pre-wrap">
                <code>{dockerCommand}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Local Development */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold mb-1">Local Development</p>
          <p className="text-xs text-slate-500 mb-4">
            Run the agent from source. Requires Node.js 18+ and <code>npm install</code> from the monorepo root.
          </p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 font-medium">Set env vars and start</p>
            <CopyButton value={localCommand} field="local" />
          </div>
          <pre className="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 whitespace-pre-wrap">
            <code>{localCommand}</code>
          </pre>
        </div>

        {/* Next Steps */}
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-4">
          <p className="text-xs font-semibold text-slate-300 mb-2">What happens next</p>
          <ul className="text-xs text-slate-400 space-y-1.5">
            <li>✓ Agent starts streaming telemetry every 5 seconds</li>
            <li>✓ It appears as <strong className="text-slate-300">online</strong> in the Topology and Infrastructure views</li>
            <li>✓ Incidents trigger automatically when CPU or Memory exceeds 80%</li>
            <li>✓ Configure webhook notifications in the settings panel below</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
