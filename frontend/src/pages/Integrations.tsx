import React from 'react';
import {
  Plug,
  MessageSquare,
  GitBranch,
  Layers,
  Activity,
  FileCode2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Integrations: React.FC = () => {
  const integrations = [
    { name: 'Slack Incident Channel', type: 'SLACK', target: '#sre-critical-incidents', status: 'ACTIVE', description: 'Automated alert notifications, approval prompts, and incident threads.' },
    { name: 'Microsoft Teams', type: 'TEAMS', target: 'Fintech OnCall Channel', status: 'ACTIVE', description: 'Webhooks for escalation policies and critical alert broadcasting.' },
    { name: 'GitHub & GitHub Actions', type: 'GITHUB', target: 'acme-corp/payment-service', status: 'ACTIVE', description: 'Webhook triggers, deployment tracking, and commit SHA correlation.' },
    { name: 'Kubernetes Cluster (EKS)', type: 'KUBERNETES', target: 'prod-eks-us-east-1', status: 'ACTIVE', description: 'Official Kubernetes client API for pod health checks and rollbacks.' },
    { name: 'Prometheus Metrics Scraper', type: 'PROMETHEUS', target: 'http://prometheus:9090', status: 'ACTIVE', description: 'Time-series metric queries for CPU, memory, and HTTP 500 error rates.' },
    { name: 'Grafana Loki Log Collector', type: 'LOKI', target: 'http://loki:3100', status: 'ACTIVE', description: 'Centralized indexing and full-text log search across microservices.' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plug className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Enterprise Integrations &amp; Connectors
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage live connected monitoring systems, CI/CD pipelines, and communication channels
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div key={item.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                  {item.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              Endpoint: <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
