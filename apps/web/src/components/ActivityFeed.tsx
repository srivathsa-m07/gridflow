import React from 'react';
import { Wifi, AlertTriangle, Activity, PlusCircle, Bell } from 'lucide-react';
import { FeedEvent } from '../types';

interface ActivityFeedProps {
  events: FeedEvent[];
}

const iconForType = (type: FeedEvent['type']) => {
  switch (type) {
    case 'agent_connected':    return <Wifi className="h-3.5 w-3.5 text-emerald-600" />;
    case 'agent_offline':      return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
    case 'incident_triggered': return <Activity className="h-3.5 w-3.5 text-amber-600" />;
    case 'agent_provisioned':  return <PlusCircle className="h-3.5 w-3.5 text-indigo-650" />;
    default:                   return <Bell className="h-3.5 w-3.5 text-stone-400" />;
  }
};

const bgForType = (type: FeedEvent['type']) => {
  switch (type) {
    case 'agent_connected':    return 'bg-emerald-50 border border-emerald-100/60';
    case 'agent_offline':      return 'bg-rose-50 border border-rose-100/60';
    case 'incident_triggered': return 'bg-amber-50 border border-amber-100/60';
    case 'agent_provisioned':  return 'bg-indigo-50 border border-indigo-100/60';
    default:                   return 'bg-stone-50 border border-stone-200/60';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-premium animate-fadeIn">
      <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-stone-400" />
          <h2 className="text-sm font-bold text-stone-900">Activity Feed</h2>
        </div>
        {events.length > 0 && (
          <span className="text-xs text-stone-500 font-semibold">{events.length} events</span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 border border-stone-100 animate-pulse">
            <Bell className="h-5 w-5 text-stone-400" />
          </div>
          <p className="text-sm font-bold text-stone-850">No activity yet</p>
          <p className="mt-1 text-xs text-stone-400">Events appear as agents connect and incidents trigger</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50/15 p-3 shadow-sm">
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bgForType(event.type)}`}>
                {iconForType(event.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-850 leading-normal">{event.message}</p>
                <p className="mt-0.5 text-[10px] text-stone-450 font-medium">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
