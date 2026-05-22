import React from 'react';
import { Clipboard, CheckCircle2, X } from 'lucide-react';

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
  const dockerCommand = `docker run --rm -e AGENT_KEY=\"${agentKey}\" -e BACKEND_URL=\"${backendUrl}\" gridflow/agent:latest`;
  const localCommand = `AGENT_KEY=\"${agentKey}\" BACKEND_URL=\"${backendUrl}\" npm run dev`;

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.warn('Clipboard copy failed', error);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-[0.24em] mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Agent is provisioned
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to your new agent</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Your agent <strong>{agentName}</strong> is ready. Use the key below to connect it securely to GRIDFLOW.
            Keep this key private — it will not be shown again.
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 transition"
          title="Dismiss onboarding panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Agent key</p>
            <p className="mt-2 break-all text-sm font-medium text-slate-100">{agentKey}</p>
          </div>
          <button
            onClick={() => copyToClipboard(agentKey)}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Clipboard className="w-4 h-4" />
            Copy key
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Docker install</p>
            <button
              onClick={() => copyToClipboard(dockerCommand)}
              className="text-xs uppercase tracking-[0.24em] text-slate-400 hover:text-slate-200"
            >
              Copy
            </button>
          </div>
          <pre className="mt-4 rounded-2xl bg-slate-950 p-3 text-xs text-slate-300 overflow-x-auto border border-slate-800">
            <code>{dockerCommand}</code>
          </pre>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Local dev</p>
            <button
              onClick={() => copyToClipboard(localCommand)}
              className="text-xs uppercase tracking-[0.24em] text-slate-400 hover:text-slate-200"
            >
              Copy
            </button>
          </div>
          <pre className="mt-4 rounded-2xl bg-slate-950 p-3 text-xs text-slate-300 overflow-x-auto border border-slate-800">
            <code>{localCommand}</code>
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Use environment variables in your shell, or adapt these commands for PowerShell.
          </p>
        </div>
      </div>
    </div>
  );
};
