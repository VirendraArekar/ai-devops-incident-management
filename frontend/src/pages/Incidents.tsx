import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Bot,
  ExternalLink,
  Clock,
  Layers
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import { apiClient } from '../api/client';
import { Incident, Severity, IncidentStatus } from '../types';
import { DUMMY_INCIDENTS } from '../data/dummyData';

interface IncidentsProps {
  onSelectIncident: (id: string) => void;
  onNavigateAi: (id: string) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ onSelectIncident, onNavigateAi }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await apiClient.get('/incidents?size=200');
        const content = res.data?.data?.content;
        setIncidents(content && content.length > 0 ? content : DUMMY_INCIDENTS);
      } catch {
        setIncidents(DUMMY_INCIDENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    const matchSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inc.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inc.primaryServiceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' ||
                        (statusFilter === 'ACTIVE' && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED') ||
                        (statusFilter === 'RESOLVED' && (inc.status === 'RESOLVED' || inc.status === 'CLOSED'));
    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Incidents Management &amp; Life Cycle
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detected infrastructure, Kubernetes and microservice failures with automated multi-agent investigation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter incidents..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="SEV_1">SEV-1 (Critical)</option>
            <option value="SEV_2">SEV-2 (High)</option>
            <option value="SEV_3">SEV-3 (Medium)</option>
            <option value="SEV_4">SEV-4 (Low)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Incidents</option>
            <option value="RESOLVED">Resolved / Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Incident Number</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Title &amp; Impact</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Detected</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectIncident(inc.id)}
                >
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {inc.incidentNumber}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="px-5 py-4 max-w-md">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {inc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {inc.description}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                    {inc.primaryServiceName}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onNavigateAi(inc.id)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        title="AI Multi-Agent Root Cause Analysis"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>AI RCA</span>
                      </button>
                      <button
                        onClick={() => onSelectIncident(inc.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
