import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Server, AlertOctagon,
  Bell, LogOut, ChevronRight, Sparkles, ArrowRight,
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-stone-200/80 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-stone-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
          <Activity className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="text-sm font-bold tracking-tight text-stone-900">GRIDFLOW</span>
        <div className="ml-auto flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className={`text-[10px] font-semibold ${isConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isConnected ? 'Live' : 'Off'}
          </span>
        </div>
      </div>

      {/* Org + plan badge */}
      <div className="mx-3 mt-3 rounded-lg border border-stone-200/50 bg-stone-50/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Organization</p>
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${
            isFreePlan
              ? 'bg-stone-100 text-stone-500 ring-stone-200/60'
              : 'bg-indigo-50 text-indigo-700 ring-indigo-100/50'
          }`}>
            {isFreePlan ? 'Free' : (user?.plan || 'Pro')}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-semibold text-stone-800">
          {user?.organizationName || user?.email || '—'}
        </p>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-0.5 px-2">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Console</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100/30'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`
            }>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            <ChevronRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
          </NavLink>
        ))}

        <div className="my-3 border-t border-stone-100" />
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">Product</p>
        <Link to="/pricing"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
          <Sparkles className="h-4 w-4 shrink-0" />
          Pricing
        </Link>
        <Link to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
          <Activity className="h-4 w-4 shrink-0" />
          Home
        </Link>
      </nav>

      {/* Upgrade nudge for free users */}
      {isFreePlan && (
        <div className="mx-3 mb-3 rounded-lg border border-stone-200/60 bg-stone-50/50 p-3">
          <p className="text-xs font-semibold text-stone-700">Upgrade to Pro</p>
          <p className="mt-0.5 text-[10px] text-stone-500 leading-normal">25 agents · 90-day history · priority support</p>
          <Link to="/pricing"
            className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            View plans <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-stone-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 border border-stone-200 text-xs font-bold text-stone-700">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-800">{user?.name || 'User'}</p>
            <p className="truncate text-[10px] text-stone-500">{user?.email}</p>
          </div>
          <button onClick={onLogout} title="Sign out"
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
