from typing import List, Dict, Any, Optional
from app.rag.embeddings import get_embedding, cosine_similarity
from app.schemas.investigation_schemas import RagChunkMatch

class KnowledgeStore:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self._initialize_default_runbooks()

    def _initialize_default_runbooks(self):
        # 1. Payment HikariCP Runbook
        self.ingest_document(
            title="Payment Gateway 500 Outage & DB Exhaustion Runbook",
            doc_type="RUNBOOK",
            content="""# Payment Service Outage Runbook
## Symptoms:
- HTTP 500 Spike on /api/v1/payments/charge
- HikariPool-1 connection timeout: Connection is not available, request timed out after 30000ms.
- Downstream Order Service receives HTTP 500.

## Root Cause Diagnostics:
1. Check recent deployments: Has a new commit modified HikariCP maximumPoolSize or leaked unclosed database connections?
2. Inspect Loki error logs with query: `{app="payment-service"} |= "ConnectionTimeoutException"`.
3. Check Jaeger trace dependency: Are downstream payment webhook calls hanging without HTTP timeouts?

## Mitigation Actions:
1. Rolling restart payment-service deployment pods to terminate orphaned connection handles.
2. If triggered immediately after deployment v4.0.2, execute instant rollback to revision 1 (v4.0.1).
3. Scale deployment pods from 2 to 4 if throughput exceeded 500 RPS.""",
            metadata={"service": "payment-service", "category": "DATABASE"}
        )

        # 2. Kubernetes CrashLoopBackOff Runbook
        self.ingest_document(
            title="Kubernetes CrashLoopBackOff & OOMKilled Troubleshooting Guide",
            doc_type="RUNBOOK",
            content="""# Kubernetes Pod CrashLoopBackOff Guide
## Symptoms:
- Pod status is CrashLoopBackOff or Error.
- Container termination reason: OOMKilled with exit code 137.

## Diagnostics:
1. Run `kubectl describe pod <pod-name>` and inspect Last State: Terminated Reason.
2. Compare memory limits with current JVM MaxRAMPercentage.
3. Check if heap memory dump file was generated in /tmp.

## Mitigation Actions:
1. Scale deployment memory request/limit from 512Mi to 1.5Gi.
2. Enable -XX:+ExitOnOutOfMemoryError in JAVA_TOOL_OPTIONS.
3. Restart failed replica set.""",
            metadata={"service": "kubernetes", "category": "INFRASTRUCTURE"}
        )

        # 3. Kafka Lag Runbook
        self.ingest_document(
            title="Kafka Consumer Lag & Notification Worker Starvation",
            doc_type="RUNBOOK",
            content="""# Kafka Consumer Group Lag Resolution
## Symptoms:
- Consumer lag on order-events topic exceeding 10,000 records.
- Notification dispatch delay > 15 minutes.

## Mitigation:
1. Scale notification-service consumer workers from 1 to 3.
2. Verify Kafka broker network connectivity.
3. Restart stuck consumer instance.""",
            metadata={"service": "notification-service", "category": "MESSAGING"}
        )

    def ingest_document(self, title: str, doc_type: str, content: str, metadata: Dict[str, Any]):
        paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 30]
        for idx, para in enumerate(paragraphs):
            embedding = get_embedding(para)
            self.chunks.append({
                "document_title": title,
                "doc_type": doc_type,
                "chunk_index": idx,
                "content": para,
                "embedding": embedding,
                "metadata": metadata
            })

    def search(self, query: str, service_name: Optional[str] = None, limit: int = 3) -> List[RagChunkMatch]:
        query_vec = get_embedding(query)
        scored = []

        for chunk in self.chunks:
            # Metadata filter if service specified
            if service_name and chunk["metadata"].get("service") and chunk["metadata"].get("service") != service_name:
                service_match = False
            else:
                service_match = True

            sim = cosine_similarity(query_vec, chunk["embedding"])
            if service_match:
                sim += 0.15 # Metadata boost for matching service

            scored.append((sim, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)

        results = []
        for sim, chunk in scored[:limit]:
            results.append(RagChunkMatch(
                document_title=chunk["document_title"],
                doc_type=chunk["doc_type"],
                content=chunk["content"],
                similarity_score=round(float(sim), 3),
                metadata=chunk["metadata"]
            ))
        return results

knowledge_store = KnowledgeStore()
