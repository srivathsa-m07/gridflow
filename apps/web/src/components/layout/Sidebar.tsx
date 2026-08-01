import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Activity, LayoutDashboard, Server, AlertOctagon, Bell, LogOut, Sparkles, Globe, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';

interface SidebarProps {
  user: { name: string; email: string; organizationName?: string; plan?: string } | null;
  onLogout: () => void;
  isConnected: boolean;
}

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/topology', icon: Server, label: 'Topology' },
  { to: '/dashboard/incidents', icon: AlertOctagon, label: 'Incidents' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

const navBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '10px 12px', borderRadius: 10,
  fontSize: 13, fontWeight: 500, textDecoration: 'none',
  transition: 'background 0.15s, color 0.15s',
  cursor: 'pointer',
};

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isConnected }) => {
  const isFreePlan = !user?.plan || user.plan === 'free';
  const initials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      position: 'fixed', inset: '0 auto 0 0', zIndex: 40,
      width: 224, display: 'flex', flexDirection: 'column',
      background: 'var(--d-raised)', borderRight: '1px solid var(--d-border)',
    }}>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: '1px solid var(--d-border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Activity size={14} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--d-text)', letterSpacing: '-0.02em' }}>GRIDFLOW</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? 'var(--ok)' : 'var(--d-text-3)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: isConnected ? 'var(--ok)' : 'var(--d-text-3)' }}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ padding: '12px' }}>
        <Card variant="darkOverlay" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--d-text-3)' }}>Workspace</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 8px', borderRadius: 8, background: isFreePlan ? 'rgba(255,255,255,0.04)' : 'rgba(37,99,235,0.12)', color: isFreePlan ? 'var(--d-text-3)' : 'var(--accent-blue)' }}>
              {isFreePlan ? 'Free' : (user?.plan || 'Pro')}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--d-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.organizationName || user?.email || '—'}
          </p>
        </Card>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ padding: '0 8px', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--d-text-3)' }}>Console</span>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            style={({ isActive }) => ({
              ...navBase,
              color: isActive ? 'var(--d-text)' : 'var(--d-text-2)',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
            })}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}

        <div style={{ margin: '14px 0', borderTop: '1px solid var(--d-border)' }} />
        <span style={{ padding: '0 8px', marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--d-text-3)' }}>Product</span>
        {[
          { to: '/pricing', icon: Sparkles, label: 'Pricing' },
          { to: '/', icon: Globe, label: 'Website' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} style={{ ...navBase, color: 'var(--d-text-2)', background: 'transparent' }}>
            <Icon size={14} style={{ flexShrink: 0 }} />
            {label}
          </Link>
        ))}
      </nav>

      {isFreePlan && (
        <Card variant="darkOverlay" style={{ margin: '8px', padding: '14px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--d-text)', margin: '0 0 6px' }}>Upgrade to Pro</p>
          <p style={{ fontSize: 12, color: 'var(--d-text-3)', margin: 0, lineHeight: 1.5 }}>25 agents · 90-day history</p>
          <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', textDecoration: 'none' }}>
            View plans <ArrowUpRight size={13} />
          </Link>
        </Card>
      )}

      <Card variant="darkOverlay" style={{ margin: 8, padding: 10, borderTop: '1px solid var(--d-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 10, padding: '8px 8px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--d-overlay)', border: '1px solid var(--d-border)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: 'var(--d-text-2)' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--d-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
            <p style={{ fontSize: 11, color: 'var(--d-text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={onLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-3)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <LogOut size={14} />
          </button>
        </div>
      </Card>
    </aside>
  );
};
