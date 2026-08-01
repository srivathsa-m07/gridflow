import React from 'react';
import { Card } from './ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  accentColor: string;
  showProgress?: boolean;
  progressValue?: number;
  footerText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, unit, accentColor, showProgress = false, progressValue = 0, footerText,
}) => {
  const pct = Math.min(100, Math.max(0, progressValue));
  const barColor = pct > 80 ? 'var(--crit)' : pct > 50 ? 'var(--warn)' : 'var(--accent-blue)';

  return (
    <Card variant="dark" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 2, opacity: 0.75, background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor} 100%)` }} />
      <p style={{ margin: 0, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--d-text-3)' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--d-text)' }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--d-text-3)' }}>{unit}</span>
      </div>
      {showProgress && (
        <div style={{ marginTop: 16, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, transition: 'width 0.4s ease' }} />
        </div>
      )}
      {footerText && <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>{footerText}</p>}
    </Card>
  );
};
