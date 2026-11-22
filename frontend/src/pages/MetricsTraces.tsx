import React, { useEffect, useState } from 'react';
import {
  Activity,
  GitCommit,
  Clock,
  Layers,
  AlertTriangle,
  ArrowRight,
  Server
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { apiClient } from '../api/client';
import { TraceSummary } from '../types';

export const MetricsTraces: React.FC = () => {
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<TraceSummary | null>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trRes, tsRes] = await Promise.all([
          apiClient.get('/traces'),
          apiClient.get('/dashboard/timeseries?metric=latency&points=30')
        ]);
        setTraces(trRes.data?.data || []);
        if (trRes.data?.data?.length > 0) {
          setSelectedTrace(trRes.data.data[0]);
        }
        setTimeSeries(tsRes.data?.data || []);
      } catch {
        // Fallback default
        const sampleTrace: TraceSummary = {
          traceId: '7b3e99f1a2c4e680',
          rootService: 'order-service',
          rootEndpoint: 'POST /api/v1/orders/checkout',
          totalDurationMs: 30450,
          totalSpans: 3,
          hasErrors: true,
          timestamp: new Date().toISOString(),
          spans: [
            { spanId: 'span-root-1', parentSpanId: undefined, serviceName: 'order-service', operationName: 'POST /api/v1/orders/checkout', durationMs: 30450, statusCode: 500, isError: true, startTime: '2026-11-23T15:15:00Z' },
            { spanId: 'span-sub-1', parentSpanId: 'span-root-1', serviceName: 'user-service', operationName: 'GET /api/v1/users/{id}', durationMs: 45, statusCode: 200, isError: false, startTime: '2026-11-23T15:15:00.010Z' },
            { spanId: 'span-sub-2', parentSpanId: 'span-root-1', serviceName: 'payment-service', operationName: 'POST /api/v1/payments/charge', durationMs: 30005, statusCode: 500, isError: true, startTime: '2026-11-23T15:15:00.060Z' }
          ]
        };
        setTraces([sampleTrace]);
        setSelectedTrace(sampleTrace);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Metrics &amp; Distributed Waterfall Traces (OpenTelemetry / Jaeger)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Correlate application latency degradation and identify exact microservice span bottlenecks
        </p>
      </div>

      {/* Latency Timeseries Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">P99 API Latency Breach (SLO: 1,000ms)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Payment Service charge endpoint latency spike</p>
          </div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-md border border-rose-500/20 self-start sm:self-auto">
            Current P99: 3,400ms
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderColor: 'rgb(51 65 85)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="paymentService" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" name="Latency (ms)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distributed Waterfall Trace Viewer */}
      {selectedTrace && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedTrace.rootEndpoint}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  HTTP 500 ERROR
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Trace ID: {selectedTrace.traceId} • Total Duration: {selectedTrace.totalDurationMs}ms
              </div>
            </div>

            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Root Bottleneck: payment-service (30,005ms)
            </span>
          </div>

          {/* Waterfall Spans */}
          <div className="space-y-3 pt-3">
            {selectedTrace.spans.map((span) => {
              const widthPct = Math.max((span.durationMs / selectedTrace.totalDurationMs) * 100, 4);
              const isBottleneck = span.durationMs > 5000;

              return (
                <div key={span.spanId} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`w-2 h-2 rounded-full ${span.isError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-slate-900 dark:text-white">[{span.serviceName}]</span>
                      <span className="text-slate-600 dark:text-slate-300">{span.operationName}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold ${span.isError ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {span.durationMs}ms ({span.statusCode})
                    </span>
                  </div>

                  {/* Waterfall Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isBottleneck
                          ? 'bg-rose-500 animate-pulse'
                          : span.isError
                          ? 'bg-rose-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
