import React from 'react';
import { Bell, Save } from 'lucide-react';

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
    <div className="max-w-2xl space-y-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
          <Bell className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Incident Webhooks</h2>
        </div>

        <p className="mb-6 text-sm text-slate-400 leading-relaxed">
          Configure Discord and Slack webhooks to receive incident notifications when CPU or memory thresholds are breached.
          A 60-second cooldown per agent prevents duplicate alerts.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Discord Webhook URL</label>
            <input
              value={settings.discordWebhookUrl}
              onChange={(e) => onChange({ ...settings, discordWebhookUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 placeholder:text-slate-600"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Slack Webhook URL</label>
            <input
              value={settings.slackWebhookUrl}
              onChange={(e) => onChange({ ...settings, slackWebhookUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 placeholder:text-slate-600"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-600">Changes apply immediately after saving.</p>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving…' : 'Save webhooks'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">When notifications fire</h3>
        <ul className="space-y-2">
          {['CPU load exceeds 80%', 'Memory usage exceeds 80%', '60-second cooldown per agent prevents spam'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
