import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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
  unit = "%",
  bulletColor
}) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${bulletColor}`} />
        {title}
      </h2>
      <div className="h-72 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
              <XAxis dataKey="formattedTime" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={yDomain} stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color, fontSize: '13px' }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                name={`${title} (${unit})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Awaiting telemetry streams...
          </div>
        )}
      </div>
    </div>
  );
};
