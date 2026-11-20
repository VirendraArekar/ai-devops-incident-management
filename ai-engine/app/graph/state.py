from typing import TypedDict, List, Dict, Any, Optional

class InvestigationState(TypedDict, total=False):
    # Input
    incident_id: str
    incident_number: str
    title: str
    severity: str
    primary_service: str
    description: Optional[str]

    # Agent 1: Investigation
    affected_services: List[str]
    scope_summary: str
    related_alerts: List[Dict[str, Any]]

    # Agent 2: Logs
    logs: List[Dict[str, Any]]
    log_findings: Dict[str, Any]

    # Agent 3: Metrics
    metrics: List[Dict[str, Any]]
    metric_anomalies: List[Dict[str, Any]]

    # Agent 4: Tracing
    traces: List[Dict[str, Any]]
    trace_bottlenecks: Dict[str, Any]

    # Agent 5: Deployments
    deployments: List[Dict[str, Any]]
    deployment_correlations: Dict[str, Any]

    # RAG Intelligence
    rag_solutions: List[Dict[str, Any]]

    # Agent 6: Root Cause Analysis
    root_causes: List[Dict[str, Any]]
    confidence_score: float
    supporting_evidence: List[Dict[str, Any]]

    # Agent 7: Remediation Planning
    recommended_actions: List[Dict[str, Any]]
    risk_level: str
    requires_approval: bool

    # Agent 8: Reporting & RCA
    executive_summary: str
    technical_report: str
    business_impact: str
    lessons_learned: str

    # Execution audit
    agent_steps: List[Dict[str, Any]]
