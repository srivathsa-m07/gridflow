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
    <div className="relative bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-premium-lg transition-all duration-300 rounded-xl p-5 shadow-premium">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-50 border border-stone-100 text-stone-500">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold tracking-tight text-stone-900">{value}</span>
        <span className="text-sm font-semibold text-stone-400">{unit}</span>
      </div>
      {showProgress && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-750 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
          />
        </div>
      )}
      {footerText && <p className="mt-4 text-xs text-stone-400">{footerText}</p>}
    </div>
  );
};
