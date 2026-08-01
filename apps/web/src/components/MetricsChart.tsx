import React from 'react';
import { Card } from './ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface MetricsChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color: string;
  gradientId: string;
  yDomain?: [number, number];
  unit?: string;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  title, data, dataKey, color, gradientId, yDomain = [0, 100], unit = '%',
}) => (
  <Card variant="dark" style={{ padding: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--d-text)' }}>{title}</h3>
      {data.length > 0 && <span style={{ fontSize: 11, color: 'var(--d-text-3)' }}>{data.length} points</span>}
    </div>

    <div style={{ height: 188 }}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="formattedTime" tickLine={false} axisLine={false} stroke="transparent" tick={{ fill: 'var(--d-text-3)', fontSize: 11 }} />
            <YAxis domain={yDomain} tickLine={false} axisLine={false} stroke="transparent" tick={{ fill: 'var(--d-text-3)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'var(--d-overlay)', border: '1px solid var(--d-border)', borderRadius: 10, fontSize: 12, boxShadow: '0 22px 44px rgba(0,0,0,0.2)' }}
              labelStyle={{ color: 'var(--d-text-2)', fontWeight: 700 }}
              itemStyle={{ color }}
              formatter={(value) => `${(value as any ?? '')}${unit}`}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--d-overlay)', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity: 0.35 }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-3)' }}>Awaiting telemetry</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--d-text-4)' }}>Metrics will appear here once agents are active.</p>
        </div>
      )}
    </div>
  </Card>
);
