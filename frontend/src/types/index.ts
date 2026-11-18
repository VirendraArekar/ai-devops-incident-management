export type Severity = 'SEV_1' | 'SEV_2' | 'SEV_3' | 'SEV_4';
export type IncidentStatus = 'DETECTED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  source: string;
  environment: string;
  primaryServiceName: string;
  affectedServices: string;
  businessImpact?: string;
  detectedAt: string;
  acknowledgedAt?: string;
  mitigatedAt?: string;
  resolvedAt?: string;
  slaDueAt?: string;
  createdAt: string;
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  eventType: string;
  previousState?: string;
  newState?: string;
  actorType: string;
  actorName: string;
  description: string;
  createdAt: string;
}

export interface IncidentEvidence {
  id: string;
  incidentId: string;
  evidenceType: 'LOG' | 'METRIC' | 'TRACE' | 'DEPLOYMENT' | 'K8S_EVENT';
  sourceReferenceId?: string;
  title: string;
  summary: string;
  confidenceScore: number;
  createdAt: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface MetricSnapshot {
  serviceName: string;
  metricName: string;
  value: number;
  unit: string;
  threshold: number;
  isAnomalous: boolean;
  timestamp: string;
}

export interface DashboardOverview {
  activeIncidentsCount: number;
  resolvedIncidentsCount: number;
  criticalAlertsCount: number;
  mttdMinutes: number;
  mttaMinutes: number;
  mttrMinutes: number;
  overallSlaCompliance: number;
  totalMonitoredServices: number;
  healthyServicesCount: number;
  degradedServicesCount: number;
  services: Array<{
    id: string;
    name: string;
    slug: string;
    status: 'HEALTHY' | 'DEGRADED' | 'FAILING';
    cpu: string;
    memory: string;
    errorRate: string;
    version: string;
  }>;
}

export interface LogRecord {
  id: string;
  serviceName: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  stackTrace?: string;
  traceId?: string;
  spanId?: string;
  labels?: Record<string, string>;
}

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  durationMs: number;
  statusCode: number;
  isError: boolean;
  startTime: string;
}

export interface TraceSummary {
  traceId: string;
  rootService: string;
  rootEndpoint: string;
  totalDurationMs: number;
  totalSpans: number;
  hasErrors: boolean;
  timestamp: string;
  spans: TraceSpan[];
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  restartCount: number;
  nodeName: string;
  ip: string;
  cpuUsage: string;
  memoryUsage: string;
  startTime: string;
  ready: boolean;
}

export interface DeploymentInfo {
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  updatedReplicas: number;
  availableReplicas: number;
  image: string;
  strategy: string;
  status: string;
}

export interface ClusterHealth {
  clusterName: string;
  provider: string;
  version: string;
  status: string;
  totalNodes: number;
  readyNodes: number;
  totalPods: number;
  failingPods: number;
  resourceUtilization: Record<string, string>;
  activeWarnings: string[];
}

export interface RemediationAction {
  id: string;
  name: string;
  actionType: string;
  targetEnvironment: string;
  commandTemplate: string;
  riskLevel: string;
  requiresApproval: boolean;
  isEnabled: boolean;
}

export interface RemediationApproval {
  id: string;
  incidentId: string;
  actionId?: string;
  requestedBy: string;
  actionSummary: string;
  riskLevel: string;
  parameters: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface RemediationExecution {
  id: string;
  approvalId?: string;
  incidentId: string;
  actionType: string;
  isDryRun: boolean;
  status: string;
  beforeState: string;
  afterState: string;
  executionLogs: string;
  recoveryVerified: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface RootCauseItem {
  category: string;
  description: string;
  confidence: number;
  is_verified_fact: boolean;
  evidence_ids: string[];
}

export interface RecommendedActionItem {
  action_type: string;
  target_resource: string;
  parameters: Record<string, any>;
  risk_level: string;
  requires_approval: boolean;
  dry_run_supported: boolean;
  justification: string;
}

export interface AgentStepRecord {
  agent_name: string;
  step_order: number;
  status: string;
  duration_ms: number;
  findings_summary: string;
  details?: Record<string, any>;
}

export interface InvestigationOutput {
  incident_id: string;
  incident_number: string;
  summary: string;
  severity: Severity;
  affected_services: string[];
  root_causes: RootCauseItem[];
  confidence_score: number;
  supporting_evidence: Array<{
    id: string;
    evidence_type: string;
    title: string;
    source: string;
    summary: string;
    confidence: number;
  }>;
  related_logs: any[];
  related_metrics: any[];
  related_traces: any[];
  deployment_correlations: Record<string, any>;
  business_impact: string;
  recommended_actions: RecommendedActionItem[];
  risk_level: string;
  requires_approval: boolean;
  agent_steps: AgentStepRecord[];
  investigation_timestamp: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  organizationId?: string;
  organizationName?: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
  role: string;
}
