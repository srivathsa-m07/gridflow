import React from 'react';
import { Server, CheckCircle, WifiOff, Clock } from 'lucide-react';
import { AgentData } from '../types';
import { Card } from './ui/Card';

interface InfrastructurePanelProps {
  agents: AgentData[];
}

export const InfrastructurePanel: React.FC<InfrastructurePanelProps> = ({ agents }) => {
  const online = agents.filter((a) => a.isOnline).length;

  return (
    <Card variant="dark" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--d-border)', paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Server size={16} color='var(--d-text-2)' />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--d-text)' }}>Infrastructure</h2>
        </div>
        <span style={{ fontSize: 11, color: 'var(--d-text-3)' }}><strong style={{ color: 'var(--d-text)' }}>{online}</strong>/{agents.length} online</span>
      </div>

      {agents.length === 0 ? (
        <div style={{ borderRadius: 18, border: '1px solid var(--d-border)', background: 'var(--d-overlay)', padding: 28, textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 44, height: 44, borderRadius: 18, background: 'var(--d-bg)', display: 'grid', placeItems: 'center' }}>
            <Server size={20} color='var(--d-text-2)' />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--d-text-2)' }}>No agents registered</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>Create an agent to start monitoring infrastructure.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18,
                border: '1px solid var(--d-border)',
                background: agent.isOnline ? 'rgba(255,255,255,0.03)' : 'rgba(220,38,38,0.08)'
              }}
            >
              <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: 14, background: agent.isOnline ? 'rgba(16,185,129,0.12)' : 'var(--d-overlay)' }}>
                {agent.isOnline ? <CheckCircle size={18} color='var(--ok)' /> : <WifiOff size={18} color='var(--d-text-2)' />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.agentId}</p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--d-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.hostname}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, auto))', gap: 12, textAlign: 'right' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--d-text-3)' }}>CPU</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: agent.cpu > 80 ? 'var(--crit)' : agent.cpu > 50 ? 'var(--warn)' : 'var(--d-text)' }}>{agent.cpu}%</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--d-text-3)' }}>MEM</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: agent.memory > 80 ? 'var(--crit)' : agent.memory > 50 ? 'var(--warn)' : 'var(--d-text)' }}>{agent.memory}%</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                  <Clock size={12} color='var(--d-text-3)' />
                  <span style={{ fontSize: 10, color: 'var(--d-text-3)' }}>{new Date(agent.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
