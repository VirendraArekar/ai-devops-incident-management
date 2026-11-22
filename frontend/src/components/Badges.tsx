import React from 'react';
import { Severity, IncidentStatus } from '../types';

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const configs: Record<Severity, { bg: string; text: string; label: string; border: string }> = {
    SEV_1: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20', label: 'SEV-1 Critical' },
    SEV_2: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20', label: 'SEV-2 High' },
    SEV_3: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-500/20', label: 'SEV-3 Medium' },
    SEV_4: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', label: 'SEV-4 Low' },
  };

  const c = configs[severity] || configs.SEV_2;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {c.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const configs: Record<IncidentStatus, { bg: string; text: string; border: string; label: string }> = {
    DETECTED: { bg: 'bg-rose-50 dark:bg-red-950/80', text: 'text-rose-700 dark:text-red-300', border: 'border-rose-200 dark:border-rose-800/40', label: 'Detected' },
    ACKNOWLEDGED: { bg: 'bg-amber-50 dark:bg-orange-950/80', text: 'text-amber-700 dark:text-orange-300', border: 'border-amber-200 dark:border-orange-800/40', label: 'Acknowledged' },
    INVESTIGATING: { bg: 'bg-indigo-50 dark:bg-indigo-950/80', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40', label: 'Investigating' },
    MITIGATING: { bg: 'bg-purple-50 dark:bg-purple-950/80', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40', label: 'Mitigating' },
    RESOLVED: { bg: 'bg-emerald-50 dark:bg-emerald-950/80', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', label: 'Resolved' },
    CLOSED: { bg: 'bg-slate-100 dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800', label: 'Closed' },
  };

  const c = configs[status] || configs.DETECTED;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.border} ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};
