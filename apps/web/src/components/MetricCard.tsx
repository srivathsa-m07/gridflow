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
  footerText
}) => {
  return (
    <div className="relative group bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-slate-700/85 transition-all duration-300 rounded-2xl p-6 shadow-xl">
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradientClass} rounded-t-2xl opacity-80`} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-bold tracking-wider uppercase">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black tracking-tight">{value}</span>
        <span className="text-slate-400 font-bold">{unit}</span>
      </div>
      {showProgress && (
        <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`bg-gradient-to-r ${gradientClass} h-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
          />
        </div>
      )}
      {footerText && (
        <p className="text-xs text-slate-500 mt-5 font-medium">{footerText}</p>
      )}
    </div>
  );
};
