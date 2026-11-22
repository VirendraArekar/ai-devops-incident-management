import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  threshold?: string;
  isAlert?: boolean;
  icon: LucideIcon;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  isPositive,
  threshold,
  isAlert = false,
  icon: Icon,
  subtext
}) => {
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      isAlert
        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 shadow-md shadow-rose-950/5'
        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700/80'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${
          isAlert ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className={`text-2xl font-bold tracking-tight ${
          isAlert ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
        }`}>{value}</span>
        {unit && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        {change && (
          <div className={`flex items-center gap-1 font-semibold text-[11px] ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}

        {threshold && (
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
            Limit: {threshold}
          </span>
        )}

        {subtext && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
