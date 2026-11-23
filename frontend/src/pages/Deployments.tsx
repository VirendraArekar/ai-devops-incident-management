import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../api/client';

export const Deployments: React.FC = () => {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [correlation, setCorrelation] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          apiClient.get('/deployments'),
          apiClient.get('/deployments/correlate?serviceName=payment-service')
        ]);
        setDeployments(dRes.data?.data || []);
        setCorrelation(cRes.data?.data);
      } catch {
        // Fallback default
        setDeployments([
          {
            id: 'd1',
            serviceName: 'payment-service',
            version: 'v4.0.2',
            commitSha: '4f9e2b1c8a01',
            commitMessage: 'Optimize transaction batching and thread pool connections',
            author: 'alex@acme.com',
            branch: 'main',
            status: 'FAILED',
            deployedAt: '14 minutes ago',
            pipelineUrl: 'https://github.com/acme/payment-service/actions/runs/1289123',
            correlatedIncident: 'INC-2026-001'
          },
          {
            id: 'd2',
            serviceName: 'order-service',
            version: 'v3.1.0',
            commitSha: '8c1b2a3d4e5f',
            commitMessage: 'Introduce cart expiry worker',
            author: 'devops@acme.com',
            branch: 'main',
            status: 'SUCCESS',
            deployedAt: '1 day ago',
            pipelineUrl: 'https://github.com/acme/order-service/actions/runs/1284102'
          },
          {
            id: 'd3',
            serviceName: 'payment-service',
            version: 'v4.0.1',
            commitSha: '9a2c3d4e5f60',
            commitMessage: 'Fix webhook retry backoff calculation',
            author: 'sarah@acme.com',
            branch: 'main',
            status: 'SUCCESS',
            deployedAt: '2 days ago',
            pipelineUrl: 'https://github.com/acme/payment-service/actions/runs/1280145'
          }
        ]);
        setCorrelation({
          suspectDeploymentFound: true,
          service: 'payment-service',
          commitSha: '4f9e2b1c8a01',
          version: 'v4.0.2',
          timeDeltaMinutes: 2.5,
          author: 'alex@acme.com',
          riskConfidence: 0.94,
          recommendation: 'Execute rollback to healthy release v4.0.1 (commit 9a2c3d4e5f60)'
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          CI/CD Deployment Intelligence &amp; GitHub Actions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Correlate production outages with recent code releases, commits and infrastructure configuration drift
        </p>
      </div>

      {/* Incident-Deployment Correlation Banner */}
      {correlation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 dark:from-rose-950/60 via-indigo-50/50 dark:via-slate-900 to-indigo-100/40 dark:to-indigo-950/40 border border-rose-300 dark:border-rose-500/30 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                High Probability Code Release Trigger
              </span>
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-mono">
              Confidence: {Math.round(correlation.riskConfidence * 100)}%
            </span>
          </div>

          <div className="text-xs text-slate-800 dark:text-white">
            Incident began <strong className="text-amber-700 dark:text-amber-400">{correlation.timeDeltaMinutes} minutes</strong> following deployment of <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{correlation.version}</span> (commit <code className="text-indigo-700 dark:text-indigo-300 font-mono">{correlation.commitSha}</code>) by <span className="text-slate-700 dark:text-slate-300 font-semibold">{correlation.author}</span>.
          </div>

          <div className="p-3 bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono flex flex-wrap items-center justify-between gap-2">
            <span>Recommendation: {correlation.recommendation}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Rollback Ready
            </span>
          </div>
        </div>
      )}

      {/* Deployments List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          Recent GitHub Actions Releases
        </h3>

        <div className="space-y-3">
          {deployments.map((dep) => (
            <div
              key={dep.id}
              className={`p-4 rounded-xl border transition-all ${
                dep.correlatedIncident
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    dep.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{dep.serviceName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {dep.version}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    sha: {dep.commitSha}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{dep.deployedAt}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    dep.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {dep.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300">
                <span>{dep.commitMessage}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{dep.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
