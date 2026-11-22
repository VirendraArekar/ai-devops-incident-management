import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { apiClient } from '../api/client';

export const RcaReports: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // Load default RCA report
    setReport({
      incidentNumber: 'INC-2026-001',
      title: 'Post-Incident Root Cause Analysis: Payment Gateway HTTP 500 Outage',
      detectedAt: 'Nov 23, 2026 15:15:00 UTC',
      resolvedAt: 'Nov 23, 2026 15:32:00 UTC',
      durationMinutes: 17,
      executiveSummary: 'On November 23, 2026, Payment Service experienced an outage resulting in 42.8% transaction failure rate following the deployment of release v4.0.2 (commit 4f9e2b1). LangGraph multi-agent AI identified HikariCP database pool exhaustion within 2.4 minutes. The lead SRE authorized a rolling rollback to revision 1 (v4.0.1) through the SRE Autonomous Remediation Engine, completely restoring normal checkout operations.',
      rootCauseTechnical: 'Commit 4f9e2b1 altered transaction batching logic without configuring timeout bounds on active EntityManager connection handles. Under sustained concurrent traffic of 450 req/s, all 20 connections in HikariPool-1 remained checked out indefinitely. New incoming requests waited 30,005ms before failing with PSQLException. Upstream Order Service received HTTP 500 downstream errors.',
      lessonsLearned: [
        'Mandate automated integration tests measuring HikariCP connection leak under concurrent mock traffic before CI merge.',
        'Implement canary deployment pipeline stage routing 5% of traffic before full rollout in GitHub Actions.',
        'Decrease connection acquisition timeout from 30s to 5s with circuit breaker fallback to avoid cascading order queue blockages.'
      ],
      preventativeActions: [
        { action: 'Update HikariCP maxLifetime and connectionTimeout to 5000ms', owner: 'Fintech Squad', status: 'IN_PROGRESS' },
        { action: 'Configure ArgoCD automatic rollback on HTTP 500 rate > 5%', owner: 'DevOps Platform Team', status: 'COMPLETED' },
        { action: 'Add Prometheus alert rule for HikariPool pending thread spikes', owner: 'Alex Vance', status: 'COMPLETED' }
      ]
    });
  }, []);

  const handleExport = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
            {report.incidentNumber} RCA POST-MORTEM
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{report.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Document Paper Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Incident Start</span>
            <span className="font-semibold text-slate-900 dark:text-white">{report.detectedAt}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Resolved At</span>
            <span className="font-semibold text-slate-900 dark:text-white">{report.resolvedAt}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Outage Duration</span>
            <span className="font-semibold text-slate-900 dark:text-white">{report.durationMinutes} minutes</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Investigation Type</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Autonomous LangGraph Multi-Agent</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            1. Executive Summary
          </h3>
          <p className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 2: Technical Root Cause Analysis */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            2. Technical Root Cause &amp; Mechanics
          </h3>
          <p className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300">
            {report.rootCauseTechnical}
          </p>
        </div>

        {/* Section 3: Lessons Learned */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            3. Lessons Learned &amp; SRE Observations
          </h3>
          <ul className="space-y-2">
            {report.lessonsLearned.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4: Action Items */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
            4. Preventative Action Items &amp; Jira Tracking
          </h3>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Preventative Action</th>
                  <th className="px-4 py-2.5">Assigned Owner</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {report.preventativeActions.map((act: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{act.action}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{act.owner}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
