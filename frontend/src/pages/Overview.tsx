import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  Server,
  Zap,
  ArrowRight,
  Bot,
  ExternalLink,
  ShieldAlert,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import { apiClient } from '../api/client';
import { DashboardOverview } from '../types';

interface OverviewProps {
  onNavigate: (tab: string, incidentId?: string) => void;
  onOpenSimulator: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, onOpenSimulator }) => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, tsRes] = await Promise.all([
          apiClient.get('/dashboard/overview'),
          apiClient.get('/dashboard/timeseries?metric=cpu&points=24')
        ]);
        setOverview(ovRes.data.data);
        setTimeSeries(tsRes.data.data);
      } catch {
        // Fallback default
        setOverview({
          activeIncidentsCount: 1,
          resolvedIncidentsCount: 14,
          criticalAlertsCount: 2,
          mttdMinutes: 2.4,
          mttaMinutes: 4.1,
          mttrMinutes: 28.5,
          overallSlaCompliance: 99.92,
          totalMonitoredServices: 4,
          healthyServicesCount: 3,
          degradedServicesCount: 1,
          services: [
            { id: '1', name: 'User Service', slug: 'user-service', status: 'HEALTHY', cpu: '28%', memory: '44%', errorRate: '0.02%', version: 'v2.4.1' },
            { id: '2', name: 'Order Service', slug: 'order-service', status: 'HEALTHY', cpu: '35%', memory: '52%', errorRate: '0.05%', version: 'v3.1.0' },
            { id: '3', name: 'Payment Service', slug: 'payment-service', status: 'DEGRADED', cpu: '89%', memory: '88%', errorRate: '42.8%', version: 'v4.0.2' },
            { id: '4', name: 'Notification Service', slug: 'notification-service', status: 'HEALTHY', cpu: '18%', memory: '38%', errorRate: '0.01%', version: 'v1.9.0' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Active Incident Urgent Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 dark:from-rose-950/60 via-amber-50 dark:via-slate-900 to-rose-100/40 dark:to-amber-950/40 border border-rose-300 dark:border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase font-mono">INC-2026-001</span>
              <SeverityBadge severity="SEV_1" />
              <StatusBadge status="INVESTIGATING" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Critical HTTP 500 Surge &amp; HikariPool Exhaustion on Payment Service
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              LangGraph multi-agent analysis detected 96% root cause correlation with commit <code className="text-indigo-600 dark:text-indigo-300 font-mono">4f9e2b1</code> (v4.0.2). Rollback proposed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('remediation')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
          >
            Review Approval
          </button>
          <button
            onClick={() => onNavigate('ai-investigation', 'a0000000-0000-0000-0000-000000000001')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            AI Investigation
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SRE KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Incidents"
          value={overview?.activeIncidentsCount || 1}
          icon={AlertTriangle}
          isAlert={true}
          change="+1 in last 15m"
          threshold="0 Critical"
        />
        <MetricCard
          title="Mean Time To Detect"
          value={overview?.mttdMinutes || 2.4}
          unit="min"
          icon={Activity}
          isPositive={true}
          change="-32% vs last month"
          subtext="Target: < 5.0m"
        />
        <MetricCard
          title="Mean Time To Resolve"
          value={overview?.mttrMinutes || 28.5}
          unit="min"
          icon={Clock}
          isPositive={true}
          change="-18% automated recovery"
          subtext="Target: < 45.0m"
        />
        <MetricCard
          title="SLA Compliance"
          value={overview?.overallSlaCompliance || 99.92}
          unit="%"
          icon={CheckCircle2}
          isPositive={true}
          change="+0.04% reliability"
          subtext="Commitment: 99.90%"
        />
      </div>

      {/* Charts & Microservices Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Telemetry Timeseries Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Live Telemetry: Distributed Error Rates &amp; CPU Spikes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time metrics polled from Prometheus scraper</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> payment-service (500 spike)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> order-service
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(51 65 85)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="paymentService" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorPayment)" name="Payment Service Error/CPU" isAnimationActive={false} />
                <Area type="monotone" dataKey="orderService" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOrder)" name="Order Service" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Microservices Health Overview */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Monitored Microservices
              </h3>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                3/4 Healthy
              </span>
            </div>

            <div className="space-y-2.5 mt-4">
              {overview?.services.map((svc) => (
                <div
                  key={svc.slug}
                  onClick={() => onNavigate('kubernetes')}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        svc.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                      }`} />
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{svc.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{svc.version}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>CPU: {svc.cpu}</span>
                      <span>Mem: {svc.memory}</span>
                      <span>Err: <strong className={svc.errorRate.startsWith('4') ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>{svc.errorRate}</strong></span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    svc.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}>
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('infrastructure')}
            className="w-full mt-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Explore Topology &amp; Service Graph</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
