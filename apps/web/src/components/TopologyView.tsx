import React from 'react';
import { Server, WifiOff, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { AgentData, IncidentData } from '../types';
import { Card } from './ui/Card';
import { formatMetricPercent, metricColor, formatLastSeenTime } from '../utils/format';

interface TopologyViewProps {
  agents: AgentData[];
  incidents: IncidentData[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({ agents, incidents }) => {
  const incidentMap = new Map(incidents.map((inc) => [inc.agentId, true]));
  const online = agents.filter((a) => a.isOnline).length;

  return (
    <Card variant="dark" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--d-border)', paddingBottom: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--d-text)' }}>Infrastructure topology</h2>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>Live agent map — {online}/{agents.length} nodes online</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, border: '1px solid var(--d-border)', background: 'var(--d-overlay)', color: 'var(--d-text-2)', fontSize: 11 }}>
          <Activity size={12} color='var(--accent-blue)' />
          Real-time
        </div>
      </div>

      {agents.length === 0 ? (
        <div style={{ borderRadius: 20, border: '1px solid var(--d-border)', background: 'var(--d-overlay)', padding: 34, textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 46, height: 46, borderRadius: 18, background: 'var(--d-bg)', display: 'grid', placeItems: 'center' }}>
            <Server size={22} color='var(--d-text-2)' />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--d-text-2)' }}>No agents connected</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>Create your first agent to populate the topology map.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {agents.map((agent) => {
            const hasIncident = incidentMap.has(agent.agentId);
            return (
              <div
                key={agent.agentId}
                style={{
                  borderRadius: 18,
                  border: '1px solid var(--d-border)',
                  padding: 18,
                  background: hasIncident ? 'rgba(220,38,38,0.08)' : agent.isOnline ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                  opacity: agent.isOnline || hasIncident ? 1 : 0.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 14, background: agent.isOnline ? 'rgba(16,185,129,0.12)' : 'var(--d-overlay)' }}>
                      {agent.isOnline ? <CheckCircle2 size={16} color='var(--ok)' /> : <WifiOff size={16} color='var(--d-text-2)' />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--d-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.agentId}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--d-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.hostname}</p>
                    </div>
                  </div>
                  {hasIncident && <AlertTriangle size={18} color='var(--crit)' />}
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ borderRadius: 16, background: 'var(--d-overlay)', padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--d-text-3)' }}>CPU</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: metricColor(agent.cpu, agent.isOnline) }}>{formatMetricPercent(agent.cpu)}</p>
                  </div>
                  <div style={{ borderRadius: 16, background: 'var(--d-overlay)', padding: '10px 12px' }}>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--d-text-3)' }}>Memory</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: metricColor(agent.memory, agent.isOnline) }}>{formatMetricPercent(agent.memory)}</p>
                  </div>
                </div>

                <p style={{ margin: '16px 0 0', fontSize: 11, color: 'var(--d-text-3)' }}>
                  {agent.isOnline ? 'Last seen' : 'Last known reading'} {formatLastSeenTime(agent.lastSeen)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
