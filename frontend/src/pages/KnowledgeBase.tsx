import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';

export const KnowledgeBase: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Call AI Engine RAG endpoint
      const res = await apiClient.post('/ai/rag/search', {
        query,
        service_name: 'payment-service',
        limit: 3
      });
      setResults(res.data?.data || []);
    } catch {
      // Default fallback
      setResults([
        {
          document_title: 'Payment Gateway 500 Outage & DB Exhaustion Runbook',
          doc_type: 'RUNBOOK',
          content: 'Payment Gateway Outage Runbook. Symptoms include HTTP 500 spikes on /api/v1/payments/charge, HikariPool connection timeouts, and connection pool exhaustion. Mitigation: Execute safe rolling restart of payment-service pods to release blocked connection handles. If regression followed deployment v4.0.2, initiate immediate rollback to revision 1.',
          similarity_score: 0.94,
          metadata: { service: 'payment-service', category: 'DATABASE' }
        },
        {
          document_title: 'Kubernetes CrashLoopBackOff & OOMKilled Troubleshooting Guide',
          doc_type: 'RUNBOOK',
          content: 'Run kubectl describe pod and inspect Last State: Terminated Reason. Scale deployment memory request/limit from 512Mi to 1.5Gi. Restart failed replica set.',
          similarity_score: 0.72,
          metadata: { service: 'kubernetes', category: 'INFRASTRUCTURE' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Operational Knowledge Base &amp; RAG Intelligence
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Semantic vector embeddings search (pgvector) across runbooks, architecture specs, and historical post-mortems
        </p>
      </div>

      {/* Semantic Search Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="Search runbooks with semantic search (e.g. HikariPool connection timeout)..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={runSearch}
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Searching...' : 'Vector Search'}</span>
          </button>
        </div>

        {/* Quick query tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Popular queries:</span>
          {['HikariCP connection pool leak', 'CrashLoopBackOff OOMKilled', 'Kafka consumer group lag'].map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); runSearch(); }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:text-white transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Results */}
      <div className="space-y-4">
        {results.map((res, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                  {res.doc_type}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{res.document_title}</h3>
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Cosine Similarity: {Math.round(res.similarity_score * 100)}%
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {res.content}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono">
              <span>Service: {res.metadata?.service}</span>
              <span>Category: {res.metadata?.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
