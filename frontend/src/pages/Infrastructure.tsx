import React, { useState } from 'react';
import {
  Server,
  Database,
  Radio,
  Clock,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { DUMMY_INFRASTRUCTURE } from '../data/dummyData';

export const Infrastructure: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = DUMMY_INFRASTRUCTURE.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                        item.type.toLowerCase().includes(search.toLowerCase()) ||
                        item.details.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Infrastructure Resources &amp; Cloud Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time topology, database connection pools, Redis caching clusters, and Kafka broker health across 200 monitored resources
          </p>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
          {filtered.length} Resources Active
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 200 infrastructure components (e.g. Postgres, Redis, EKS, NAT Gateway)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {['ALL', 'HEALTHY', 'DEGRADED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-2xl border transition-all ${
              item.isAlert
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30'
                : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  {item.type}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h3>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                item.status === 'HEALTHY'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {item.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">{item.details}</p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">CPU Usage</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.cpu}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Memory Usage</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{item.memory}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
