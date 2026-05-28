import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface MetricsChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  gradientId: string;
  yDomain?: [number, number];
  unit?: string;
  bulletColor: string;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  title,
  data,
  dataKey,
  color,
  gradientId,
  yDomain = [0, 100],
  unit = '%',
  bulletColor,
}) => {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900 p-5 shadow-lg shadow-black/20">
      <div className="mb-5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${bulletColor}`} />
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      </div>
      <div className="h-56 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={yDomain} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                itemStyle={{ color }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                name={`${title} (${unit})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 mx-auto rounded-lg bg-slate-800 border border-slate-800/50 flex items-center justify-center">
                <span className={`h-2 w-2 rounded-full ${bulletColor} opacity-40`} />
              </div>
              <p className="text-xs text-slate-500 font-semibold">Awaiting telemetry</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
