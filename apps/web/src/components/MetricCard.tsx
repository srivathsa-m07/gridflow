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
    <div className="relative bg-slate-900 border border-slate-800/80 hover:border-stone-300 hover:shadow-xl shadow-black/40 transition-all duration-300 rounded-xl p-5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-800/50 text-slate-400">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold tracking-tight text-slate-100">{value}</span>
        <span className="text-sm font-semibold text-slate-500">{unit}</span>
      </div>
      {showProgress && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-750 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
          />
        </div>
      )}
      {footerText && <p className="mt-4 text-xs text-slate-500">{footerText}</p>}
    </div>
  );
};
