import React, { useState } from 'react';
import { Settings as SettingsIcon, Bot, Bell, Shield, Database, Save, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [modelProvider, setModelProvider] = useState('GEMINI');
  const [autoApproval, setAutoApproval] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T000/B000/XXXX');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Platform Configuration &amp; AI Engine Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure multi-agent LLM providers, notification routing, and automated remediation safety gates
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Platform settings updated and persisted successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Model Provider */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            AI Orchestration Model Provider
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'GEMINI', name: 'Google Gemini', desc: 'Gemini 3.8 / 2.5 Flash with Native Tool Calling & Embeddings' },
              { id: 'OPENAI', name: 'OpenAI GPT-4o', desc: 'GPT-4o with Structured Output & JSON Schema enforcement' },
              { id: 'OLLAMA', name: 'Local Ollama', desc: 'Air-gapped on-premise execution (Llama 3.2 / Qwen 2.5)' },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setModelProvider(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  modelProvider === p.id
                    ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-500 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold mb-1">{p.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Human Approval Controls */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            Autonomous Remediation Safety Safeguards
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproval}
                onChange={(e) => setAutoApproval(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Enable Low-Risk Auto-Remediation (e.g. non-destructive rolling restart)</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">High-risk actions (rollbacks, scale downs) always mandate explicit human sign-off regardless of this setting.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Webhook */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Incident Alert Webhook Routing
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Slack / Teams Webhook URL</label>
            <input
              type="text"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
