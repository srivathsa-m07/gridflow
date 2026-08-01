import React from 'react';
import { AlertOctagon, Cpu, Database, BrainCircuit, ShieldCheck } from 'lucide-react';
import { IncidentData } from '../types';
import { Card } from './ui/Card';

interface IncidentPanelProps {
  incidents: IncidentData[];
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents }) => {
  return (
    <Card variant="dark" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--d-border)', paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertOctagon size={18} color='var(--crit)' />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--d-text)' }}>Incident intelligence</h2>
        </div>
        {incidents.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(220,38,38,0.18)', background: 'rgba(220,38,38,0.12)', color: 'var(--crit)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
            {incidents.length} open
          </span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div style={{ borderRadius: 20, border: '1px solid var(--d-border)', background: 'var(--d-overlay)', padding: 32, textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 46, height: 46, borderRadius: 18, background: 'rgba(16,185,129,0.12)', display: 'grid', placeItems: 'center' }}>
            <ShieldCheck size={22} color='var(--ok)' />
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--d-text)' }}>All systems nominal</p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>No incidents detected</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14, maxHeight: 520, overflowY: 'auto', paddingRight: 6 }}>
          {incidents.map((inc) => (
            <div key={inc.incidentId} style={{ borderRadius: 18, border: '1px solid var(--d-border)', background: 'var(--d-overlay)', padding: 18, display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', border: inc.severity === 'critical' ? '1px solid rgba(220,38,38,0.2)' : '1px solid rgba(245,158,11,0.2)', background: inc.severity === 'critical' ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)', color: inc.severity === 'critical' ? 'var(--crit)' : 'var(--warn)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: inc.severity === 'critical' ? 'var(--crit)' : 'var(--warn)' }} />
                      {inc.severity}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--d-text-2)' }}>
                      {inc.type === 'HIGH_CPU' ? <Cpu size={14} color='var(--accent-blue)' /> : <Database size={14} color='var(--d-text)' />}
                      <span>{inc.agentId}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-3)' }}>{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--d-text)' }}>{inc.message}</p>

              {inc.aiSummary && (
                <div style={{ display: 'flex', gap: 12, borderRadius: 16, border: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.1)', padding: 14 }}>
                  <BrainCircuit size={16} color='var(--accent-blue)' />
                  <div>
                    <p style={{ margin: 0, marginBottom: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent-blue)' }}>AI Analysis</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--d-text-2)', fontStyle: 'italic', lineHeight: 1.6 }}>{inc.aiSummary}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
