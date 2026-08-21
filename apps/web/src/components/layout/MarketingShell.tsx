import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { Button } from '../ui/Button';

const NAV_LINKS = [
  { to: '/features', label: 'Product' },
  { to: '/architecture', label: 'Features' },
  { to: '/pricing', label: 'Partners' },
];

const FOOTER_RESOURCES = [
  { label: 'Docs', to: '/docs' },
  { label: 'Architecture', to: '/architecture' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Features', to: '/features' },
];

const FOOTER_PRODUCT = [
  { label: 'Agents', to: '/features' },
  { label: 'Topology', to: '/features' },
  { label: 'Incidents', to: '/features' },
];

interface MarketingShellProps {
  children?: React.ReactNode;
}

export const MarketingShell: React.FC<MarketingShellProps> = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(227,233,223,0.82)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={13} color="var(--bg)" />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Gridflow</span>
        </Link>
        <nav className="marketing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="overline" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </nav>
        <Button asLink href="/login" variant="blue">Enter app</Button>
      </div>
    </header>

    <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px', width: '100%' }}>
      {children}
    </main>

    <footer className="bg-dot" style={{ background: 'var(--d-bg)', marginTop: 64, padding: '56px 24px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid-3col" style={{ display: 'grid', gap: 32, gridTemplateColumns: '1.4fr 1fr 1fr', marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--d-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={12} color="var(--d-bg)" />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--d-text)' }}>Gridflow</span>
            </div>
            <p className="overline" style={{ color: 'var(--d-text-3)', marginBottom: 10 }}>Subscribe for release notes</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--d-border)', maxWidth: 280, paddingBottom: 8 }}>
              <input placeholder="Email" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--d-text)', fontFamily: 'var(--font-mono)', fontSize: 13 }} />
              <button type="button" className="overline" style={{ background: 'none', border: 'none', color: 'var(--mint)', cursor: 'pointer' }}>Subscribe</button>
            </div>
          </div>

          <div>
            <p className="overline" style={{ color: 'var(--d-text-3)', marginBottom: 16 }}>Resources</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {FOOTER_RESOURCES.map((item) => (
                <Link key={item.label} to={item.to} className="overline" style={{ color: 'var(--d-text-2)', textDecoration: 'none' }}>{item.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <p className="overline" style={{ color: 'var(--d-text-3)', marginBottom: 16 }}>Product</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {FOOTER_PRODUCT.map((item) => (
                <Link key={item.label} to={item.to} className="overline" style={{ color: 'var(--d-text-2)', textDecoration: 'none' }}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, paddingTop: 20, borderTop: '1px solid var(--d-border)' }}>
          <span className="overline" style={{ color: 'var(--d-text-3)' }}>© {new Date().getFullYear()} Gridflow. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/terms" className="overline" style={{ color: 'var(--d-text-3)', textDecoration: 'none' }}>Terms</Link>
            <Link to="/privacy" className="overline" style={{ color: 'var(--d-text-3)', textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>

        <p style={{ marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8, color: 'var(--d-text-3)', opacity: 0.7 }}>
          All content available on this website is general in nature and is for informational purposes only. It does not constitute
          operational, financial, or infrastructure advice specific to your environment. Gridflow does not guarantee uptime or outcomes
          for any monitored system; individuals are urged to validate their own alerting and incident-response procedures.
        </p>
      </div>
    </footer>
  </div>
);
