import React, { useEffect, useState } from 'react';
import { Cpu, Copy, Check, Eye, KeyRound, Ban, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiService } from '../services/api';
import { AgentRecord, AgentPendingProvisioning, InstallCommands } from '../types';

interface AgentsPageProps {
  organizationName?: string;
  backendUrl: string;
}

const STATUS_LABELS: Record<AgentRecord['status'], string> = {
  created: 'Provisioning',
  online: 'Online',
  offline: 'Offline',
  revoked: 'Revoked',
};

const STATUS_COLORS: Record<AgentRecord['status'], string> = {
  created: 'var(--warn)',
  online: 'var(--ok)',
  offline: 'var(--d-text-3)',
  revoked: 'var(--crit)',
};

const StatusPill: React.FC<{ status: AgentRecord['status'] }> = ({ status }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    color: STATUS_COLORS[status], background: `${STATUS_COLORS[status]}1a`,
    border: `1px solid ${STATUS_COLORS[status]}33`,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[status] }} />
    {STATUS_LABELS[status]}
  </span>
);

const formatDate = (value?: string | Date) => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

// Lightweight modal overlay shared by the detail / install-command / rotate
// dialogs on this page — kept local to this file rather than a new shared
// component system, to keep footprint minimal.
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; width?: number }> = ({ title, onClose, children, width = 560 }) => (
  <div
    onClick={onClose}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px', zIndex: 100, overflowY: 'auto' }}
  >
    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: width }}>
      <Card variant="dark" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--d-text)' }}>{title}</p>
          <button onClick={onClose} type="button" style={{ border: '1px solid var(--d-border)', borderRadius: 999, background: 'var(--d-overlay)', color: 'var(--d-text-2)', padding: 8, cursor: 'pointer', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
        {children}
      </Card>
    </div>
  </div>
);

const CopyLine: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable (non-HTTPS context)
    }
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--d-text-3)' }}>{label}</span>
        <button onClick={copy} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', color: copied ? 'var(--ok)' : 'var(--accent-blue)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, borderRadius: 12, background: 'var(--d-bg)', border: '1px solid var(--d-border)', padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--d-text-2)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
        <code>{value}</code>
      </pre>
    </div>
  );
};

const iconButtonStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 8, border: '1px solid var(--d-border)',
  background: 'var(--d-overlay)', color: 'var(--d-text-2)', cursor: 'pointer',
};

export const AgentsPage: React.FC<AgentsPageProps> = ({ organizationName, backendUrl }) => {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionAgentId, setActionAgentId] = useState<string | null>(null);

  const [detail, setDetail] = useState<{ agent: AgentRecord; pendingProvisioning: AgentPendingProvisioning | null } | null>(null);
  const [installCommands, setInstallCommands] = useState<{ agentName: string; commands: InstallCommands; expiresAt: string | Date } | null>(null);
  const [rotateResult, setRotateResult] = useState<{ agentName: string; agentKey: string } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ type: 'revoke' | 'delete'; agent: AgentRecord } | null>(null);

  const loadAgents = async () => {
    try {
      setError(null);
      const list = await apiService.listAgents();
      setAgents(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const withAction = async (id: string, fn: () => Promise<void>) => {
    setActionAgentId(id);
    try {
      await fn();
    } catch (err: any) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionAgentId(null);
    }
  };

  const handleViewDetails = (agent: AgentRecord) => withAction(agent.id, async () => {
    const result = await apiService.getAgent(agent.id);
    setDetail(result);
  });

  const handleCopyInstall = (agent: AgentRecord) => withAction(agent.id, async () => {
    const result = await apiService.getInstallCommand(agent.id, agent.backendUrl || backendUrl);
    setInstallCommands({ agentName: agent.name, commands: result.commands, expiresAt: result.provisioningTokenExpiresAt });
  });

  const handleRotate = (agent: AgentRecord) => withAction(agent.id, async () => {
    const result = await apiService.rotateAgentKey(agent.id);
    setRotateResult({ agentName: agent.name, agentKey: result.agentKey });
    await loadAgents();
  });

  const handleConfirmedAction = async () => {
    if (!confirmTarget) return;
    const { type, agent } = confirmTarget;
    setConfirmTarget(null);
    await withAction(agent.id, async () => {
      if (type === 'revoke') {
        await apiService.revokeAgent(agent.id);
      } else {
        await apiService.deleteAgent(agent.id);
      }
      await loadAgents();
    });
  };

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 16px' }}>
          <p style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}><strong>Error:</strong> {error}</p>
          <button onClick={loadAgents} style={{ background: 'rgba(220,38,38,0.12)', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fca5a5', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      <Card variant="dark" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--d-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--d-text)' }}>Provisioned agents</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--d-text-3)' }}>{agents.length} agent{agents.length === 1 ? '' : 's'} in {organizationName || 'your organization'}</p>
          </div>
          <Button variant="secondary" dark onClick={loadAgents} style={{ padding: 8 }} title="Refresh">
            <RefreshCw size={14} />
          </Button>
        </div>

        {loading ? (
          <p style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--d-text-3)' }}>Loading agents…</p>
        ) : agents.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--d-overlay)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Cpu size={20} color="var(--d-text-2)" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--d-text)', margin: '0 0 6px' }}>No agents yet</p>
            <p style={{ fontSize: 13, color: 'var(--d-text-3)', margin: 0 }}>Provision an agent from the top bar to see it appear here.</p>
          </div>
        ) : (
          <div>
            <p className="overline tablet-scroll-hint" style={{ display: 'none', color: 'var(--d-text-3)', padding: '10px 20px 0' }}>Swipe to see all columns and actions →</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  {['Agent Name', 'Status', 'Registration', 'Last Seen', 'Created At', 'Organization', 'Actions'].map((h) => (
                    <th key={h} className={h === 'Organization' ? 'hide-tablet' : undefined} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--d-text-3)', borderBottom: '1px solid var(--d-border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const busy = actionAgentId === agent.id;
                  const isRevoked = agent.status === 'revoked';
                  return (
                    <tr key={agent.id} style={{ borderBottom: '1px solid var(--d-border)' }}>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--d-text)' }}>{agent.name}</td>
                      <td style={{ padding: '14px 16px' }}><StatusPill status={agent.status} /></td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: agent.registered ? 'var(--ok)' : 'var(--d-text-3)' }}>{agent.registered ? 'Registered' : 'Pending'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--d-text-2)', whiteSpace: 'nowrap' }}>{formatDate(agent.lastHeartbeatAt)}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--d-text-2)', whiteSpace: 'nowrap' }}>{formatDate(agent.createdAt)}</td>
                      <td className="hide-tablet" style={{ padding: '14px 16px', fontSize: 12, color: 'var(--d-text-2)' }}>{organizationName || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button disabled={busy} onClick={() => handleViewDetails(agent)} title="View details" style={iconButtonStyle}>
                            <Eye size={14} />
                          </button>
                          <button disabled={busy || isRevoked} onClick={() => handleCopyInstall(agent)} title="Copy install commands" style={{ ...iconButtonStyle, opacity: isRevoked ? 0.4 : 1 }}>
                            <Copy size={14} />
                          </button>
                          <button disabled={busy || isRevoked || !agent.registered} onClick={() => handleRotate(agent)} title="Rotate credential" style={{ ...iconButtonStyle, opacity: isRevoked || !agent.registered ? 0.4 : 1 }}>
                            <KeyRound size={14} />
                          </button>
                          <button disabled={busy || isRevoked} onClick={() => setConfirmTarget({ type: 'revoke', agent })} title="Revoke agent" style={{ ...iconButtonStyle, opacity: isRevoked ? 0.4 : 1, color: 'var(--crit)' }}>
                            <Ban size={14} />
                          </button>
                          <button disabled={busy} onClick={() => setConfirmTarget({ type: 'delete', agent })} title="Delete agent" style={{ ...iconButtonStyle, color: 'var(--crit)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </Card>

      {detail && (
        <Modal title={`Agent details — ${detail.agent.name}`} onClose={() => setDetail(null)}>
          <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
            {[
              ['Status', STATUS_LABELS[detail.agent.status]],
              ['Registration', detail.agent.registered ? 'Registered' : 'Pending registration'],
              ['Hostname', detail.agent.hostname || '—'],
              ['Backend URL', detail.agent.backendUrl || '—'],
              ['Last seen', formatDate(detail.agent.lastHeartbeatAt)],
              ['Created at', formatDate(detail.agent.createdAt)],
              ['Credential last rotated', formatDate(detail.agent.secretRotatedAt)],
              ['Revoked at', formatDate(detail.agent.revokedAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--d-border)' }}>
                <span style={{ color: 'var(--d-text-3)' }}>{label}</span>
                <span style={{ color: 'var(--d-text)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            {detail.pendingProvisioning && (
              <div style={{ marginTop: 6, padding: 12, borderRadius: 10, background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--warn)' }}>
                  Pending provisioning token {detail.pendingProvisioning.used ? 'has been used' : `expires ${formatDate(detail.pendingProvisioning.expiresAt)}`}. Use "Copy install commands" to issue a fresh one.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {installCommands && (
        <Modal title={`Install commands — ${installCommands.agentName}`} onClose={() => setInstallCommands(null)}>
          <p style={{ fontSize: 12, color: 'var(--d-text-3)', margin: '0 0 16px' }}>
            This provisioning token expires {formatDate(installCommands.expiresAt)} and can only be used once.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ok)', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px' }}>Recommended</span>
          </div>
          <CopyLine label="Run as a background service" value={installCommands.commands.dockerRun} />
          <details style={{ marginTop: 4 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--d-text-3)', userSelect: 'none', marginBottom: 12 }}>
              Advanced installation options
            </summary>
            <CopyLine label="Pull the image separately" value={installCommands.commands.dockerPull} />
            <CopyLine label="Run in foreground" value={installCommands.commands.dockerRunSimple} />
            <CopyLine label="Local development" value={installCommands.commands.local} />
          </details>
        </Modal>
      )}

      {rotateResult && (
        <Modal title={`Credential rotated — ${rotateResult.agentName}`} onClose={() => setRotateResult(null)}>
          <p style={{ fontSize: 12, color: 'var(--warn)', margin: '0 0 16px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            The previous credential is now invalid. Update the agent's configuration with this new key — it is shown only once.
          </p>
          <CopyLine label="New agent key" value={rotateResult.agentKey} />
        </Modal>
      )}

      {confirmTarget && (
        <Modal title={confirmTarget.type === 'revoke' ? 'Revoke agent?' : 'Delete agent?'} onClose={() => setConfirmTarget(null)} width={420}>
          <p style={{ fontSize: 13, color: 'var(--d-text-2)', margin: '0 0 20px', lineHeight: 1.6 }}>
            {confirmTarget.type === 'revoke'
              ? `"${confirmTarget.agent.name}" will no longer be able to authenticate. This cannot be undone, but the record is kept for history.`
              : `"${confirmTarget.agent.name}" and its provisioning history will be permanently deleted. This cannot be undone.`}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" dark onClick={() => setConfirmTarget(null)}>Cancel</Button>
            <Button variant="danger" dark onClick={handleConfirmedAction}>
              {confirmTarget.type === 'revoke' ? 'Revoke' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
