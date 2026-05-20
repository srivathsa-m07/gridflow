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
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 shadow-lg hover:shadow-rose-500/5 transition-all duration-300 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <div>
              <p className="text-sm font-bold tracking-wide">SYSTEM ALERT: {alert.type}</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{alert.message} at {alert.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
