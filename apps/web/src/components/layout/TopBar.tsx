import React from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  isConnected: boolean;
  onRefresh: () => void;
  onNewAgent: () => void;
  showNewAgent?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  isConnected,
  onRefresh,
  onNewAgent,
  showNewAgent = true,
}) => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800/80 bg-[#080d16]/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            isConnected
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {isConnected ? 'Live' : 'Disconnected'}
        </div>

        <button
          onClick={onRefresh}
          title="Sync telemetry"
          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {showNewAgent && (
          <button
            onClick={onNewAgent}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            New Agent
          </button>
        )}
      </div>
    </header>
  );
};
