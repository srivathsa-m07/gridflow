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
    <header className="flex h-14 items-center justify-between border-b border-stone-200/80 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            isConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isConnected ? 'Live' : 'Disconnected'}
        </div>

        <button
          onClick={onRefresh}
          title="Sync telemetry"
          className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 hover:border-stone-300 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {showNewAgent && (
          <button
            onClick={onNewAgent}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            New Agent
          </button>
        )}
      </div>
    </header>
  );
};
