import React, { useState } from 'react';
import {
  X,
  Zap,
  Database,
  Flame,
  Layers,
  Cpu,
  Radio,
  Clock,
  GitBranch,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../api/client';

interface IncidentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggered: (result: any) => void;
}

export const IncidentSimulatorModal: React.FC<IncidentSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggered
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: '500_surge',
      title: 'Payment API HTTP 500 Surge',
      severity: 'SEV_1',
      service: 'payment-service',
      description: 'Simulates 42.8% error rate on /api/v1/payments/charge following deploy v4.0.2.',
      icon: Flame,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
    },
    {
      id: 'db_exhaustion',
      title: 'HikariCP Database Pool Exhaustion',
      severity: 'SEV_1',
      service: 'payment-service',
      description: 'HikariPool-1 connections exhausted, timing out at 30,005ms waiting for DB handles.',
      icon: Database,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
    },
    {
      id: 'crashloop',
      title: 'Kubernetes CrashLoopBackOff & OOMKilled',
      severity: 'SEV_1',
      service: 'payment-service',
      description: 'Pod failed readiness probe and was terminated with exit code 137 (OOMKilled).',
      icon: Layers,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30'
    },
    {
      id: 'high_cpu',
      title: 'High CPU Utilization (>94%)',
      severity: 'SEV_2',
      service: 'order-service',
      description: 'Order processing threads peg CPU across 2 pods due to infinite retry loop.',
      icon: Cpu,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
    },
    {
      id: 'redis_failure',
      title: 'Redis Connection Timeout',
      severity: 'SEV_2',
      service: 'payment-service',
      description: 'Lettuce Redis connection pool exhausted on idempotency verification key lookups.',
      icon: Radio,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
    },
    {
      id: 'kafka_lag',
      title: 'Kafka Consumer Group Lag (+18,450 msgs)',
      severity: 'SEV_3',
      service: 'notification-service',
      description: 'Topic order-events consumer group notification-workers lag builds up.',
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30'
    },
    {
      id: 'latency_spike',
      title: 'P99 Checkout Latency Breach (4.8s)',
      severity: 'SEV_2',
      service: 'order-service',
      description: 'P99 response time on checkout flow exceeds 1,000ms SLO threshold.',
      icon: Zap,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
    },
    {
      id: 'failed_deploy',
      title: 'GitHub Actions Failed Release',
      severity: 'SEV_2',
      service: 'payment-service',
      description: 'Release v4.0.2 deployed commit 4f9e2b1 causing instant health probe failures.',
      icon: GitBranch,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30'
    }
  ];

  const handleTrigger = async (scenarioId: string) => {
    setLoading(scenarioId);
    setSuccessMsg(null);
    try {
      const res = await apiClient.post(`/alerts/simulate?scenario=${scenarioId}`);
      setSuccessMsg(`Incident simulated successfully! Correlated into ${res.data?.data?.incidentNumber || 'INC-2026-001'}`);
      onTriggered(res.data?.data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Offline fallback simulation
      setSuccessMsg(`Simulated incident trigger for scenario '${scenarioId}' active.`);
      onTriggered({ scenarioId, status: 'DETECTED', incidentNumber: 'INC-2026-001' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SRE Incident Simulator &amp; Demo Scenarios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trigger realistic production failures to test automated detection, AI root cause analysis and remediation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="m-6 mb-0 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scenario Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[70vh] overflow-y-auto">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isThisLoading = loading === sc.id;
            return (
              <div
                key={sc.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-slate-700 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${sc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {sc.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{sc.service}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                      {sc.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {sc.description}
                  </p>
                </div>

                <button
                  disabled={loading !== null}
                  onClick={() => handleTrigger(sc.id)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-rose-600 shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isThisLoading ? (
                    <span className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full border-2 border-slate-400 dark:border-white/20 border-t-indigo-600 dark:border-t-white animate-spin" />
                      Dispatching Alert...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 fill-current text-amber-500" />
                      <span>Trigger Scenario</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Safe demo mode: All incidents are contained within isolated simulation harnesses.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
