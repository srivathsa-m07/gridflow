import React from 'react';
import { Bell, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Lead } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';

interface NotificationsPageProps {
  settings: { discordWebhookUrl: string; slackWebhookUrl: string };
  onChange: (settings: { discordWebhookUrl: string; slackWebhookUrl: string }) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  settings,
  onChange,
  onSave,
  isSaving,
}) => {
  return (
    <div style={{ maxWidth: '760px', display: 'grid', gap: 18 }}>
      <Card variant="dark" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--d-border)', paddingBottom: 8, marginBottom: 8 }}>
          <Bell size={16} color="var(--d-text-2)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--d-text)' }}>Incident Webhooks</div>
        </div>

        <Lead dark style={{ marginBottom: 12 }}>Configure Discord and Slack webhooks to receive incident notifications when CPU or memory thresholds are breached. A 60-second cooldown per agent prevents duplicate alerts.</Lead>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--d-text-3)' }}>Discord Webhook URL</label>
            <input
              value={settings.discordWebhookUrl}
              onChange={(e) => onChange({ ...settings, discordWebhookUrl: e.target.value })}
              style={{ width: '100%', borderRadius: 12, border: '1px solid var(--d-border)', background: 'var(--d-raised)', color: 'var(--d-text)', padding: '12px 14px', fontSize: 14 }}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--d-text-3)' }}>Slack Webhook URL</label>
            <input
              value={settings.slackWebhookUrl}
              onChange={(e) => onChange({ ...settings, slackWebhookUrl: e.target.value })}
              style={{ width: '100%', borderRadius: 12, border: '1px solid var(--d-border)', background: 'var(--d-raised)', color: 'var(--d-text)', padding: '12px 14px', fontSize: 14 }}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--d-border)', paddingTop: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--d-text-3)' }}>Changes apply immediately after saving.</div>
          <Button variant="blue" onClick={onSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} disabled={isSaving}>
            <Save size={14} /> {isSaving ? 'Saving…' : 'Save webhooks'}
          </Button>
        </div>
      </Card>

      <Card variant="dark" style={{ padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--d-text-3)', marginBottom: 8 }}>When notifications fire</div>
        <ul style={{ display: 'grid', gap: 8 }}>
          {['CPU load exceeds 80%', 'Memory usage exceeds 80%', '60-second cooldown per agent prevents spam'].map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--d-text-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 6, background: 'var(--accent-blue)', display: 'inline-block' }} />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
