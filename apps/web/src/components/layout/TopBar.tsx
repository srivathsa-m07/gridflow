import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  title: string;
  subtitle?: string;
  isConnected: boolean;
  onRefresh: () => void;
  onNewAgent: () => void;
  showNewAgent?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title, subtitle, isConnected, onRefresh, onNewAgent, showNewAgent = true,
}) => (
  <header style={{
    height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', borderBottom: '1px solid var(--d-border)',
    background: 'var(--d-raised)', position: 'sticky', top: 0, zIndex: 30,
  }}>
    <div>
      <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--d-text)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 11, color: 'var(--d-text-3)', margin: 0 }}>{subtitle}</p>}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 500,
        background: isConnected ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isConnected ? 'rgba(22,163,74,0.2)' : 'var(--d-border)'}`,
        color: isConnected ? 'var(--ok)' : 'var(--d-text-3)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--ok)' : 'var(--d-text-3)' }} />
        {isConnected ? 'Connected' : 'Offline'}
      </div>

      <Button variant="secondary" onClick={onRefresh} title="Sync" style={{ padding: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={14} />
      </Button>

      {showNewAgent && (
        <Button variant="blue" onClick={onNewAgent} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px' }}>
          <Plus size={14} /> New Agent
        </Button>
      )}
    </div>
  </header>
);
