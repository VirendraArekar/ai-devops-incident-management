import React, { useEffect, useState } from 'react';
import {
  FileCode2,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { apiClient } from '../api/client';
import { LogRecord } from '../types';

export const LogsExplorer: React.FC = () => {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [anomaly, setAnomaly] = useState<any>(null);
  const [service, setService] = useState('all');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        apiClient.get(`/logs/search?service=${service}&level=${level}&query=${search}`),
        apiClient.get('/logs/anomalies')
      ]);
      setLogs(lRes.data?.data || []);
      setAnomaly(aRes.data?.data);
    } catch {
      // Fallback
      setLogs([
        {
          id: 'log-1',
          serviceName: 'payment-service',
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          message: 'org.postgresql.util.PSQLException: Connection pool exhausted. Request timed out after 30005ms waiting for a connection.',
          stackTrace: 'org.postgresql.util.PSQLException: Connection pool exhausted\n\tat com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:217)\n\tat com.devops.demo.payment.repository.PaymentRepository.save(PaymentRepository.java:42)',
          traceId: '7b3e99f1a2c4e680',
          spanId: 'span-pay-99'
        },
        {
          id: 'log-2',
          serviceName: 'order-service',
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          message: 'PaymentGatewayException: Downstream call to http://payment-service:8082 returned HTTP 500 Internal Server Error',
          stackTrace: 'com.devops.demo.order.exception.PaymentGatewayException: HTTP 500\n\tat com.devops.demo.order.client.PaymentClient.executeCharge(PaymentClient.java:38)',
          traceId: '7b3e99f1a2c4e680',
          spanId: 'span-ord-102'
        },
        {
          id: 'log-3',
          serviceName: 'user-service',
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'User authentication succeeded for principal user_991823@gmail.com with JWT issued.',
          traceId: '1a2b3c4d5e6f7a8b'
        }
      ]);
      setAnomaly({
        anomalyDetected: true,
        service: 'payment-service',
        errorFrequencySpike: '+1,420% over 15-min baseline',
        topException: 'PSQLException: Connection pool exhausted',
        correlatedTraceId: '7b3e99f1a2c4e680'
      });
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [service, level]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Centralized Log Explorer (Grafana Loki)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time indexed application, container, Kubernetes and database log streams
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              placeholder="Query logs (e.g. timeout)..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="payment-service">payment-service</option>
            <option value="order-service">order-service</option>
            <option value="user-service">user-service</option>
            <option value="notification-service">notification-service</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="ERROR">ERROR only</option>
            <option value="WARN">WARN only</option>
            <option value="INFO">INFO only</option>
          </select>
        </div>
      </div>

      {/* Log Anomaly Banner */}
      {anomaly && anomaly.anomalyDetected && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 dark:from-rose-950/60 via-amber-50 dark:via-slate-900 to-rose-100/40 dark:to-slate-900 border border-rose-300 dark:border-rose-500/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Log Anomaly Detected</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  {anomaly.errorFrequencySpike}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-mono">
                {anomaly.topException} (Correlated Trace ID: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{anomaly.correlatedTraceId}</span>)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Log Records Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Displaying {logs.length} live records</span>
          <span className="font-mono text-[11px]">Source: Loki Query Engine</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-xs overflow-x-auto">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isError = log.level === 'ERROR';
            const isWarn = log.level === 'WARN';

            return (
              <div key={log.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div
                  className="flex items-start gap-3 cursor-pointer min-w-[700px]"
                  onClick={() => log.stackTrace && toggleExpand(log.id)}
                >
                  <div className="shrink-0 mt-0.5 text-slate-400 dark:text-slate-500">
                    {log.stackTrace ? (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /> : <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-3.5 inline-block" />
                    )}
                  </div>

                  <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    isError ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' :
                    isWarn ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {log.level}
                  </span>

                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold shrink-0">
                    [{log.serviceName}]
                  </span>

                  <span className={`flex-1 break-all ${isError ? 'text-rose-700 dark:text-rose-200 font-medium' : 'text-slate-800 dark:text-slate-300'}`}>
                    {log.message}
                  </span>

                  {log.traceId && (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                      trace: {log.traceId.slice(0, 8)}...
                    </span>
                  )}
                </div>

                {/* Stack Trace Expansion */}
                {isExpanded && log.stackTrace && (
                  <div className="mt-3 ml-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-rose-700 dark:text-rose-300 whitespace-pre-wrap overflow-x-auto">
                    {log.stackTrace}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
