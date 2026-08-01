import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/docs', label: 'Docs' },
  { to: '/pricing', label: 'Pricing' },
];

interface MarketingShellProps {
  children?: React.ReactNode;
}

export const MarketingShell: React.FC<MarketingShellProps> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(250,249,246,0.85)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(15,23,42,0.06)',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>GRIDFLOW</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>

    <main style={{ flex: 1, maxWidth: 1120, margin: '0 auto', padding: '0 24px', width: '100%' }}>
      {children}
    </main>

    <footer style={{ borderTop: '1px solid rgba(15,23,42,0.06)', padding: '28px 24px', marginTop: 40 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>© {new Date().getFullYear()} GRIDFLOW. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/terms" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>Terms</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </div>
    </footer>
  </div>
);
