import React, { useEffect, useState } from 'react';
import {
  Layers,
  Server,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ClusterHealth, PodInfo, DeploymentInfo } from '../types';

export const Kubernetes: React.FC = () => {
  const [health, setHealth] = useState<ClusterHealth | null>(null);
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, pRes, dRes, eRes] = await Promise.all([
          apiClient.get('/kubernetes/clusters'),
          apiClient.get('/kubernetes/pods'),
          apiClient.get('/kubernetes/deployments'),
          apiClient.get('/kubernetes/events'),
        ]);
        setHealth(hRes.data?.data);
        setPods(pRes.data?.data || []);
        setDeployments(dRes.data?.data || []);
        setEvents(eRes.data?.data || []);
      } catch {
        // Fallback default
        setHealth({
          clusterName: 'prod-eks-us-east-1',
          provider: 'AWS EKS',
          version: 'v1.31.2',
          status: 'DEGRADED',
          totalNodes: 6,
          readyNodes: 6,
          totalPods: 48,
          failingPods: 2,
          resourceUtilization: { cpuAllocated: '68%', memoryAllocated: '79%', storageAllocated: '54%' },
          activeWarnings: ['Pod payment-service-7bb5df74bf-2x9la has restarted 4 times in the last 15 minutes']
        });
        setPods([
          { name: 'payment-service-7bb5df74bf-2x9la', namespace: 'production', status: 'Running', restartCount: 4, nodeName: 'ip-10-0-3-142', ip: '10.0.3.88', cpuUsage: '880m', memoryUsage: '1.4Gi', startTime: '2026-11-23T15:00:00Z', ready: false },
          { name: 'payment-service-7bb5df74bf-9pqlm', namespace: 'production', status: 'CrashLoopBackOff', restartCount: 6, nodeName: 'ip-10-0-3-143', ip: '10.0.3.92', cpuUsage: '120m', memoryUsage: '512Mi', startTime: '2026-11-23T15:10:00Z', ready: false },
          { name: 'order-service-679bc8f89d-4km1z', namespace: 'production', status: 'Running', restartCount: 0, nodeName: 'ip-10-0-2-110', ip: '10.0.2.14', cpuUsage: '320m', memoryUsage: '720Mi', startTime: '2026-11-22T10:00:00Z', ready: true },
          { name: 'order-service-679bc8f89d-7hj2p', namespace: 'production', status: 'Running', restartCount: 0, nodeName: 'ip-10-0-2-111', ip: '10.0.2.19', cpuUsage: '340m', memoryUsage: '740Mi', startTime: '2026-11-22T10:00:00Z', ready: true },
          { name: 'user-service-598d9cc99-mzk29', namespace: 'production', status: 'Running', restartCount: 0, nodeName: 'ip-10-0-1-55', ip: '10.0.1.22', cpuUsage: '210m', memoryUsage: '480Mi', startTime: '2026-11-21T08:00:00Z', ready: true },
          { name: 'notification-service-4dc79ba1-bb92a', namespace: 'production', status: 'Running', restartCount: 0, nodeName: 'ip-10-0-1-56', ip: '10.0.1.29', cpuUsage: '150m', memoryUsage: '380Mi', startTime: '2026-11-20T12:00:00Z', ready: true }
        ]);
        setDeployments([
          { name: 'payment-service', namespace: 'production', replicas: 2, readyReplicas: 0, updatedReplicas: 2, availableReplicas: 0, image: 'acme/payment-service:v4.0.2', strategy: 'RollingUpdate', status: 'DEGRADED' },
          { name: 'order-service', namespace: 'production', replicas: 2, readyReplicas: 2, updatedReplicas: 2, availableReplicas: 2, image: 'acme/order-service:v3.1.0', strategy: 'RollingUpdate', status: 'HEALTHY' }
        ]);
        setEvents([
          { type: 'Warning', reason: 'Unhealthy', object: 'Pod/payment-service-7bb5df74bf-2x9la', message: 'Readiness probe failed: HTTP 500 Internal Server Error', time: '1 min ago' },
          { type: 'Warning', reason: 'BackOff', object: 'Pod/payment-service-7bb5df74bf-9pqlm', message: 'Back-off restarting failed container in pod payment-service', time: '3 mins ago' }
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cluster Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono text-[10px]">
              {health?.provider || 'AWS EKS'}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{health?.version || 'v1.31.2'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{health?.clusterName || 'prod-eks-us-east-1'}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {health?.status || 'DEGRADED'}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Worker Nodes</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">{health?.readyNodes}/{health?.totalNodes} Ready</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Pods</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">{health?.totalPods}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Failing Pods</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-base">{health?.failingPods} Failing</span>
          </div>
        </div>
      </div>

      {/* Pods Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          Kubernetes Pod Health &amp; Probes
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-2.5">Pod Name</th>
                <th className="px-4 py-2.5">Namespace</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Restarts</th>
                <th className="px-4 py-2.5">CPU / Memory</th>
                <th className="px-4 py-2.5">Node IP</th>
                <th className="px-4 py-2.5 text-right">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {pods.map((pod) => (
                <tr key={pod.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{pod.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{pod.namespace}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pod.status === 'Running' && pod.ready
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {pod.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    <span className={pod.restartCount > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                      {pod.restartCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                    {pod.cpuUsage} / {pod.memoryUsage}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                    {pod.ip} ({pod.nodeName})
                  </td>
                  <td className="px-4 py-3 text-right">
                    {pod.ready ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">1/1 READY</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold">0/1 UNHEALTHY</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kubernetes Warning Events */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          Recent Kubernetes Lifecycle Events
        </h3>

        <div className="space-y-2">
          {events.map((ev, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono shrink-0">
                  {ev.reason}
                </span>
                <div>
                  <span className="font-mono text-slate-900 dark:text-white text-[11px] block">{ev.object}</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs">{ev.message}</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
