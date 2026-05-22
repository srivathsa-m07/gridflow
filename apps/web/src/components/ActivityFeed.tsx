import React from 'react';
import { Activity, Bell, Wifi, AlertTriangle, PlusCircle } from 'lucide-react';
import { FeedEvent } from '../types';

interface ActivityFeedProps {
  events: FeedEvent[];
}

const iconForType = (type: FeedEvent['type']) => {
  switch (type) {
    case 'agent_connected':
      return <Wifi className="w-4 h-4 text-emerald-400" />;
    case 'agent_offline':
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    case 'incident_triggered':
      return <Activity className="w-4 h-4 text-amber-400" />;
    case 'agent_provisioned':
      return <PlusCircle className="w-4 h-4 text-cyan-400" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  return (
    <section className="rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live activity</p>
          <h2 className="text-2xl font-semibold text-slate-100">Operational feed</h2>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">No recent operations yet.</p>
          <p className="mt-2 text-xs text-slate-400">Activity will appear here as agents connect, disconnect, and incidents trigger.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-start gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200">
                {iconForType(event.type)}
              </div>
              <div className="flex-1 text-sm leading-snug">
                <p className="font-semibold text-slate-100">{event.message}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
