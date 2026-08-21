import React from 'react';
import { Wifi, AlertTriangle, Activity, PlusCircle, Bell } from 'lucide-react';
import { FeedEvent } from '../types';
import { Card } from './ui/Card';

interface ActivityFeedProps { events: FeedEvent[]; }

const TYPE_CONFIG = {
  agent_connected:    { icon: Wifi,          color: 'var(--ok)',         bg: 'rgba(16,165,127,0.12)' },
  agent_offline:      { icon: AlertTriangle, color: 'var(--crit)',       bg: 'rgba(220,38,38,0.12)' },
  incident_triggered: { icon: Activity,      color: 'var(--warn)',       bg: 'rgba(245,158,11,0.12)' },
  agent_provisioned:  { icon: PlusCircle,    color: 'var(--accent-blue)', bg: 'rgba(31,109,74,0.12)' },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => (
  <Card variant="dark" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px', borderBottom: '1px solid var(--d-border)' }}>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--d-text)' }}>Activity</h2>
      {events.length > 0 && <span style={{ fontSize: 11, color: 'var(--d-text-3)' }}>{events.length} events</span>}
    </div>

    {events.length === 0 ? (
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '40px 20px', color: 'var(--d-text-2)' }}>
        <div style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 18, background: 'var(--d-overlay)', marginBottom: 18 }}>
          <Bell size={20} color='var(--d-text-3)' />
        </div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--d-text)' }}>No activity yet</p>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--d-text-3)', textAlign: 'center', maxWidth: 240 }}>Events appear here as agents connect, go offline, and incidents are triggered.</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: 10, padding: '18px 18px 20px' }}>
        {events.slice(0, 8).map((event) => {
          const cfg = TYPE_CONFIG[event.type] || { icon: Bell, color: 'var(--d-text-3)', bg: 'var(--d-overlay)' };
          const Icon = cfg.icon;
          return (
            <div
              key={event.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', cursor: 'default' }}
            >
              <div style={{ width: 30, minWidth: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 12, background: cfg.bg }}>
                <Icon size={14} color={cfg.color} />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--d-text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.message}</p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--d-text-3)' }}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </Card>
);
