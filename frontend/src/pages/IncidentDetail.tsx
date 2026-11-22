import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Bot,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Wrench,
  Layers,
  Send,
  ExternalLink
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import { apiClient } from '../api/client';
import { Incident, IncidentEvent, IncidentEvidence, IncidentComment } from '../types';

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
  onNavigateAi: (id: string) => void;
  onNavigateRemediation: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incidentId,
  onBack,
  onNavigateAi,
  onNavigateRemediation
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<IncidentEvent[]>([]);
  const [evidence, setEvidence] = useState<IncidentEvidence[]>([]);
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'comments'>('timeline');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, timeRes, evRes, comRes] = await Promise.all([
          apiClient.get(`/incidents/${incidentId}`),
          apiClient.get(`/incidents/${incidentId}/timeline`),
          apiClient.get(`/incidents/${incidentId}/evidence`),
          apiClient.get(`/incidents/${incidentId}/comments`),
        ]);
        setIncident(incRes.data?.data);
        setTimeline(timeRes.data?.data || []);
        setEvidence(evRes.data?.data || []);
        setComments(comRes.data?.data || []);
      } catch {
        // Fallback demo state
        setIncident({
          id: incidentId,
          incidentNumber: 'INC-2026-001',
          title: 'Critical HTTP 500 Surge & HikariPool Exhaustion on Payment Service',
          description: 'Automated monitoring detected a sharp spike in HTTP 500 error responses (42.8% error rate) and database connection acquisition timeouts following deployment v4.0.2.',
          severity: 'SEV_1',
          status: 'INVESTIGATING',
          source: 'AUTOMATIC',
          environment: 'production',
          primaryServiceName: 'payment-service',
          affectedServices: '["payment-service", "order-service"]',
          businessImpact: 'Direct checkout revenue impact: approximately 180 customer transactions failing per minute on checkout flow.',
          detectedAt: new Date(Date.now() - 14 * 60000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 60000).toISOString()
        });

        setTimeline([
          {
            id: '1',
            incidentId,
            eventType: 'STATUS_CHANGE',
            previousState: undefined,
            newState: 'DETECTED',
            actorType: 'SYSTEM',
            actorName: 'Prometheus AlertManager',
            description: 'Incident automatically created via firing alert Http500ErrorRateSpike (>5%).',
            createdAt: new Date(Date.now() - 14 * 60000).toISOString()
          },
          {
            id: '2',
            incidentId,
            eventType: 'STATUS_CHANGE',
            previousState: 'DETECTED',
            newState: 'INVESTIGATING',
            actorType: 'AI_AGENT',
            actorName: 'LangGraph SRE Supervisor',
            description: 'Automated multi-agent investigation dispatched across logs, metrics, traces, and git deployments.',
            createdAt: new Date(Date.now() - 12 * 60000).toISOString()
          }
        ]);

        setEvidence([
          {
            id: 'ev-1',
            incidentId,
            evidenceType: 'METRIC',
            title: 'HTTP 500 Spike Metric (42.8%)',
            summary: 'Error rate escalated from 0.04% to 42.8% within 2 minutes after git commit 4f9e2b1 deployment.',
            confidenceScore: 0.98,
            createdAt: new Date(Date.now() - 13 * 60000).toISOString()
          },
          {
            id: 'ev-2',
            incidentId,
            evidenceType: 'LOG',
            title: 'HikariCP Pool Timeout Exception',
            summary: 'PSQLException: Connection is not available, request timed out after 30005ms in payment-service.',
            confidenceScore: 1.0,
            createdAt: new Date(Date.now() - 13 * 60000).toISOString()
          },
          {
            id: 'ev-3',
            incidentId,
            evidenceType: 'DEPLOYMENT',
            title: 'Release v4.0.2 Deployment',
            summary: 'Commit 4f9e2b1 deployed 14 minutes ago by author alex@acme.com.',
            confidenceScore: 0.95,
            createdAt: new Date(Date.now() - 14 * 60000).toISOString()
          }
        ]);
      }
    };

    fetchData();
  }, [incidentId]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await apiClient.patch(`/incidents/${incidentId}/status`, {
        status: newStatus,
        reason: `Transitioned manually to ${newStatus}`
      });
      setIncident(res.data?.data);
      const timeRes = await apiClient.get(`/incidents/${incidentId}/timeline`);
      setTimeline(timeRes.data?.data || []);
    } catch {
      if (incident) {
        setIncident({ ...incident, status: newStatus as any });
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/incidents/${incidentId}/comments`, {
        content: newComment,
        isInternal: true
      });
      setComments([...comments, res.data?.data]);
      setNewComment('');
    } catch {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          incidentId,
          authorName: 'Alex Vance (Lead SRE)',
          content: newComment,
          isInternal: true,
          createdAt: new Date().toISOString()
        }
      ]);
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!incident) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incidents</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateAi(incidentId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Investigation Graph</span>
          </button>
          <button
            onClick={onNavigateRemediation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Remediation Workflow</span>
          </button>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {incident.incidentNumber}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          {/* Status Transitions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">Move to:</span>
            {['ACKNOWLEDGED', 'INVESTIGATING', 'MITIGATING', 'RESOLVED', 'CLOSED'].map((st) => (
              <button
                key={st}
                disabled={incident.status === st}
                onClick={() => handleUpdateStatus(st)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  incident.status === st
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700/60'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{incident.title}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">{incident.description}</p>
        </div>

        {incident.businessImpact && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-rose-950 dark:text-white mb-0.5">Business &amp; Revenue Impact:</strong>
              {incident.businessImpact}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Primary Service</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{incident.primaryServiceName}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Environment</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{incident.environment}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Detected At</span>
            <span className="text-slate-700 dark:text-slate-200">{new Date(incident.detectedAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Detection Source</span>
            <span className="text-slate-700 dark:text-slate-200 uppercase font-mono">{incident.source}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Timeline ({timeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Correlated Evidence ({evidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'comments'
              ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussion ({comments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {timeline.map((ev, idx) => (
              <div key={ev.id || idx} className="relative">
                <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ev.eventType}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {ev.actorName} ({ev.actorType})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(ev.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((ev) => (
            <div key={ev.id} className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {ev.evidenceType}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Confidence: {Math.round(ev.confidenceScore * 100)}%
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">{ev.summary}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="space-y-3">
            {comments.map((cm) => (
              <div key={cm.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{cm.authorName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(cm.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">{cm.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add investigation findings or notes..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Note</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
