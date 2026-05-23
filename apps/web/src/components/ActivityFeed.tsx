import React from 'react';
import { Wifi, AlertTriangle, Activity, PlusCircle, Bell } from 'lucide-react';
import { FeedEvent } from '../types';

interface ActivityFeedProps {
  events: FeedEvent[];
}

const iconForType = (type: FeedEvent['type']) => {
  switch (type) {
    case 'agent_connected':    return <Wifi className="h-3.5 w-3.5 text-emerald-400" />;
    case 'agent_offline':      return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
    case 'incident_triggered': return <Activity className="h-3.5 w-3.5 text-amber-400" />;
    case 'agent_provisioned':  return <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />;
    default:                   return <Bell className="h-3.5 w-3.5 text-slate-400" />;
  }
};

const bgForType = (type: FeedEvent['type']) => {
  switch (type) {
    case 'agent_connected':    return 'bg-emerald-500/10';
    case 'agent_offline':      return 'bg-rose-500/10';
    case 'incident_triggered': return 'bg-amber-500/10';
    case 'agent_provisioned':  return 'bg-cyan-500/10';
    default:                   return 'bg-slate-800';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Activity Feed</h2>
        </div>
        {events.length > 0 && (
          <span className="text-xs text-slate-500">{events.length} events</span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Bell className="h-5 w-5 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">No activity yet</p>
          <p className="mt-1 text-xs text-slate-600">Events appear as agents connect and incidents trigger</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bgForType(event.type)}`}>
                {iconForType(event.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 leading-snug">{event.message}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
