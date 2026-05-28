import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Server, AlertOctagon,
  Bell, LogOut, ChevronRight, ArrowRight,
} from 'lucide-react';

interface SidebarProps {
  user: { name: string; email: string; organizationName?: string; plan?: string } | null;
  onLogout: () => void;
  isConnected: boolean;
}

const navItems = [
  { to: '/dashboard',               icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/topology',      icon: Server,          label: 'Topology' },
  { to: '/dashboard/incidents',     icon: AlertOctagon,    label: 'Incidents' },
  { to: '/dashboard/notifications', icon: Bell,            label: 'Notifications' },
];

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isConnected }) => {
  const isFreePlan = !user?.plan || user.plan === 'free';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-800 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <Activity className="h-4 w-4 text-indigo-400" />
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-100">GRIDFLOW</span>
        <div className="ml-auto flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className={`text-[10px] font-semibold ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isConnected ? 'Live' : 'Off'}
          </span>
        </div>
      </div>

      {/* Org + plan badge */}
      <div className="mx-3 mt-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Organization</p>
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${
            isFreePlan
              ? 'bg-slate-800 text-slate-400 ring-slate-700'
              : 'bg-indigo-500/20 text-indigo-400 ring-indigo-500/30'
          }`}>
            {isFreePlan ? 'Free' : (user?.plan || 'Pro')}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-semibold text-slate-200">
          {user?.organizationName || user?.email || '—'}
        </p>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-0.5 px-2">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Console</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            <ChevronRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Upgrade nudge for free users */}
      {isFreePlan && (
        <div className="mx-3 mb-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs font-semibold text-slate-200">Upgrade to Pro</p>
          <p className="mt-0.5 text-[10px] text-slate-400 leading-normal">25 agents · 90-day history · priority support</p>
          <Link to="/pricing"
            className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            View plans <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">{user?.name || 'User'}</p>
            <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <button onClick={onLogout} title="Sign out"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
