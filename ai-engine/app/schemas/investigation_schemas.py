from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class RootCauseItem(BaseModel):
    category: str = Field(..., description="Category e.g. INFRA_EXHAUSTION, CODE_DEFECT, CONFIG_DRIFT, DEPENDENCY_FAILURE")
    description: str = Field(..., description="Concise root cause explanation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    is_verified_fact: bool = Field(..., description="True if proven by immutable monitoring logs/metrics, False if hypothesis")
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of monitoring evidence supporting this cause")

class SupportingEvidenceItem(BaseModel):
    id: str
    evidence_type: str = Field(..., description="LOG, METRIC, TRACE, DEPLOYMENT, K8S_EVENT")
    title: str
    source: str
    summary: str
    raw_snippet: Optional[Dict[str, Any]] = None
    confidence: float = 1.0

class RecommendedActionItem(BaseModel):
    action_type: str = Field(..., description="RESTART_POD, SCALE_DEPLOYMENT, ROLLBACK_DEPLOYMENT, FLUSH_CONNECTIONS")
    target_resource: str = Field(..., description="Target pod or deployment name")
    parameters: Dict[str, Any] = Field(default_factory=dict)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    requires_approval: bool = Field(True, description="Human approval required before execution")
    dry_run_supported: bool = True
    justification: str

class AgentStepRecord(BaseModel):
    agent_name: str
    step_order: int
    status: str = "COMPLETED"
    duration_ms: int = 0
    findings_summary: str
    details: Dict[str, Any] = Field(default_factory=dict)

class InvestigationInput(BaseModel):
    incident_id: str
    incident_number: str
    title: str
    severity: str
    primary_service: str
    description: Optional[str] = None
    timestamp: Optional[datetime] = None

class InvestigationOutput(BaseModel):
    incident_id: str
    incident_number: str
    summary: str
    severity: str
    affected_services: List[str]
    root_causes: List[RootCauseItem]
    confidence_score: float
    supporting_evidence: List[SupportingEvidenceItem]
    related_logs: List[Dict[str, Any]]
    related_metrics: List[Dict[str, Any]]
    related_traces: List[Dict[str, Any]]
    deployment_correlations: Dict[str, Any]
    business_impact: str
    recommended_actions: List[RecommendedActionItem]
    risk_level: str
    requires_approval: bool
    agent_steps: List[AgentStepRecord] = Field(default_factory=list)
    investigation_timestamp: datetime = Field(default_factory=datetime.utcnow)

class RagQueryRequest(BaseModel):
    query: str
    service_name: Optional[str] = None
    limit: int = 3

class RagChunkMatch(BaseModel):
    document_title: str
    doc_type: str
    content: str
    similarity_score: float
    metadata: Dict[str, Any]
