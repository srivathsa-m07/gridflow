import React from 'react';
import { RefreshCw, Plus, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  title: string;
  subtitle?: string;
  isConnected: boolean;
  onRefresh: () => void;
  onNewAgent: () => void;
  showNewAgent?: boolean;
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title, subtitle, isConnected, onRefresh, onNewAgent, showNewAgent = true, onMenuClick,
}) => (
  <header style={{
    height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px 0 28px', gap: 12, borderBottom: '1px solid var(--d-border)',
    background: 'var(--d-raised)', position: 'sticky', top: 0, zIndex: 30,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <button className="mobile-menu-btn" onClick={onMenuClick} type="button" style={{
        border: '1px solid var(--d-border)', borderRadius: 8, background: 'var(--d-overlay)',
        color: 'var(--d-text-2)', padding: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Menu size={16} />
      </button>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--d-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
        {subtitle && <p className="overline" style={{ color: 'var(--d-text-3)', margin: 0, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <div className="overline topbar-status-pill" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        background: isConnected ? 'rgba(31,157,99,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isConnected ? 'rgba(31,157,99,0.25)' : 'var(--d-border)'}`,
        color: isConnected ? 'var(--ok)' : 'var(--d-text-3)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--ok)' : 'var(--d-text-3)' }} />
        {isConnected ? 'Connected' : 'Offline'}
      </div>

      <Button variant="secondary" dark onClick={onRefresh} title="Sync" style={{ padding: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={14} />
      </Button>

      {showNewAgent && (
        <Button variant="blue" onClick={onNewAgent} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px' }}>
          <Plus size={14} /> <span className="new-agent-label">New Agent</span>
        </Button>
      )}
    </div>
  </header>
);
