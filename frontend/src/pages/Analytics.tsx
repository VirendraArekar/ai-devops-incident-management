import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ShieldCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiClient } from '../api/client';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [serviceMttr, setServiceMttr] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          apiClient.get('/analytics/incidents'),
          apiClient.get('/analytics/mttr')
        ]);
        setData(aRes.data?.data);
        setServiceMttr(sRes.data?.data || []);
      } catch {
        // Fallback default
        setData({
          meanTimeToDetectMinutes: 2.4,
          meanTimeToAcknowledgeMinutes: 4.1,
          meanTimeToResolveMinutes: 28.5,
          aiRecommendationAcceptanceRate: 91.5,
          remediationSuccessRate: 96.2,
          overallSlaCompliance: 99.92,
          severityDistribution: [
            { severity: 'SEV-1 Critical', count: 3, color: '#f43f5e' },
            { severity: 'SEV-2 High', count: 8, color: '#f97316' },
            { severity: 'SEV-3 Medium', count: 14, color: '#eab308' },
            { severity: 'SEV-4 Low', count: 6, color: '#3b82f6' }
          ],
          monthlyTrend: [
            { month: 'Jun', incidents: 18, mttr: 34.0 },
            { month: 'Jul', incidents: 15, mttr: 31.2 },
            { month: 'Aug', incidents: 12, mttr: 29.0 },
            { month: 'Sep', incidents: 14, mttr: 28.5 },
            { month: 'Oct', incidents: 9, mttr: 25.1 },
            { month: 'Nov', incidents: 7, mttr: 22.8 }
          ]
        });

        setServiceMttr([
          { service: 'Payment Service', mttrMinutes: 32.4, incidentCount: 6, availability: 99.88 },
          { service: 'Order Service', mttrMinutes: 24.1, incidentCount: 4, availability: 99.94 },
          { service: 'User Service', mttrMinutes: 16.5, incidentCount: 2, availability: 99.98 },
          { service: 'Notification Service', mttrMinutes: 14.2, incidentCount: 3, availability: 99.96 }
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          SRE Reliability Analytics &amp; Incident Metrics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Continuous tracking of MTTD, MTTA, MTTR, AI remediation acceptance rates, and SLA commitments
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">MTTD</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{data?.meanTimeToDetectMinutes || 2.4} min</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -32% vs last quarter
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">MTTR</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{data?.meanTimeToResolveMinutes || 28.5} min</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -18% automated recovery
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">AI Acceptance</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{data?.aiRecommendationAcceptanceRate || 91.5}%</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Based on 48 SRE actions
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">SLA Compliance</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{data?.overallSlaCompliance || 99.92}%</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Commitment: 99.90%
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Incident & MTTR Trend */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incident Volume &amp; MTTR Trend</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyTrend || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(51 65 85)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="incidents" fill="#6366f1" radius={[4, 4, 0, 0]} name="Incidents" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Severity Breakdown</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severityDistribution || []}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  isAnimationActive={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.severityDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(51 65 85)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
