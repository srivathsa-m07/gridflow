import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  gradientClass: string;
  showProgress?: boolean;
  progressValue?: number;
  footerText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  gradientClass,
  showProgress = false,
  progressValue = 0,
  footerText,
}) => {
  return (
    <div className="relative bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${gradientClass} opacity-60 rounded-t-xl`} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</span>
        <div className="text-slate-500">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-slate-100">{value}</span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>
      {showProgress && (
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
          />
        </div>
      )}
      {footerText && <p className="mt-4 text-xs text-slate-600">{footerText}</p>}
    </div>
  );
};
