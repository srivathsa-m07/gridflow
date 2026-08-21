// Shared formatting helpers so agent telemetry never renders an invalid
// value like `undefined%`/`NaN%`/`Invalid Date`, and offline agents don't
// display their last-known numbers as if they were current/healthy.

export const formatMetricPercent = (value: number | undefined): string =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value}%` : '—';

// Offline (or missing-data) agents always render in the muted/neutral
// color, regardless of how healthy their last-known reading was — a stale
// "30% CPU" from an agent that's been offline for an hour must never read
// as "currently healthy."
export const metricColor = (value: number | undefined, isOnline: boolean): string => {
  if (!isOnline || typeof value !== 'number' || Number.isNaN(value)) return 'var(--d-text-3)';
  if (value > 80) return 'var(--crit)';
  if (value > 50) return 'var(--warn)';
  return 'var(--d-text)';
};

export const formatLastSeenTime = (value: Date | string | undefined): string => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
