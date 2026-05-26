import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AlertData } from '../types';

interface AlertBannerProps {
  alerts: AlertData[];
  onDismiss: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 animate-fadeIn shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">{alert.type.replace('_', ' ')}</p>
              <p className="text-xs text-rose-700 font-medium">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="ml-4 rounded-md p-1 text-rose-450 hover:bg-rose-100 hover:text-rose-900 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
