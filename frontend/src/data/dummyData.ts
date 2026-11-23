import { Incident, LogRecord, TraceSummary, PodInfo, DeploymentInfo, RemediationAction, RemediationApproval, RemediationExecution } from '../types';

const SERVICES = ['payment-service', 'order-service', 'user-service', 'notification-service', 'ingress-gateway', 'auth-service', 'inventory-service', 'analytics-service'];
const SEVERITIES: ('SEV_1' | 'SEV_2' | 'SEV_3' | 'SEV_4')[] = ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'];
const STATUSES: ('DETECTED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED' | 'CLOSED')[] = ['DETECTED', 'ACKNOWLEDGED', 'INVESTIGATING', 'MITIGATING', 'RESOLVED', 'CLOSED'];

const INCIDENT_TOPICS = [
  'HTTP 500 Error Spike & Pool Exhaustion',
  'P99 API Latency SLA Violation',
  'Kubernetes Pod CrashLoopBackOff after OOMKill',
  'High CPU Saturation sustained above 92%',
  'Critical Kafka Consumer Group Lag Accumulation',
  'Canary Deployment Synthetic Health Check Failure',
  'Redis Command Timeout & Idempotency Key Miss',
  'Database Lock Contention on Billing Transaction',
  'Ingress Gateway 502 Bad Gateway Surge',
  'Disk IOPS Saturation on Primary PostgreSQL Volume',
  'Downstream OAuth Provider 401 Authentication Drop',
  'gRPC Transport Stream Closed Unexpectedly',
  'Thread Pool Worker Rejection on Async Queue',
  'Memory Working Set Pressure nearing cgroup Limit',
  'Network Packet Drop Rate exceeding 2.5% on EKS Node',
  'Failed Secret Decryption on Vault Agent Sidecar',
  'Elasticsearch Cluster Red Status: Unassigned Shards',
  'Deadlock detected during Order State Machine Transition',
  'Rate Limit Breached for External Stripe Webhook',
  'Certificate Expiration Warning on Internal mTLS Mesh'
];

const FIRST_NAMES = ['Alex', 'Sarah', 'Jordan', 'Elena', 'Marcus', 'David', 'Rachel', 'Liam', 'Sophia', 'James', 'Maya', 'Lucas', 'Priya', 'Daniel', 'Olivia', 'Kevin', 'Aisha', 'Gabriel', 'Chloe', 'Nathan'];
const LAST_NAMES = ['Vance', 'Connor', 'Kim', 'Rostova', 'Chen', 'Miller', 'Green', 'Nakamoto', 'Patel', 'Dubois', 'Smith', 'Johansson', 'Tanaka', 'Garcia', 'Novak', 'Silva', 'Taylor', 'Wilson', 'Anderson', 'Thomas'];

// ============================================================================
// 1. 200 DUMMY INCIDENTS
// ============================================================================
export const DUMMY_INCIDENTS: Incident[] = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const sev = SEVERITIES[i % SEVERITIES.length];
  const stat = i === 1 ? 'INVESTIGATING' : STATUSES[i % STATUSES.length];
  const title = `${INCIDENT_TOPICS[i % INCIDENT_TOPICS.length]} on ${sName}`;
  const detectedTime = new Date(Date.now() - i * 3.5 * 3600000).toISOString();

  return {
    id: `a0000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
    incidentNumber: `INC-2026-${String(i).padStart(4, '0')}`,
    title,
    description: `Automated detection identified metric threshold violation and anomalous telemetry on ${sName}.`,
    severity: sev,
    status: stat,
    source: i % 3 === 0 ? 'DATADOG' : i % 3 === 1 ? 'PROMETHEUS' : 'AUTOMATIC',
    environment: i % 5 === 0 ? 'staging' : 'production',
    primaryServiceName: sName,
    affectedServices: JSON.stringify([sName, SERVICES[(i + 1) % SERVICES.length]]),
    detectedAt: detectedTime,
    resolvedAt: (stat === 'RESOLVED' || stat === 'CLOSED') ? new Date(new Date(detectedTime).getTime() + 28 * 60000).toISOString() : undefined,
    createdAt: detectedTime
  };
});

// ============================================================================
// 2. 200 DUMMY LOGS
// ============================================================================
const LOG_ERROR_MESSAGES = [
  'org.postgresql.util.PSQLException: Connection pool exhausted. Request timed out after 30005ms waiting for a connection.',
  'PaymentGatewayException: Downstream call to http://payment-service:8083 returned HTTP 500 Internal Server Error',
  'io.lettuce.core.RedisCommandTimeoutException: Command timed out after 3000ms [HGETALL idempotency:session_key]',
  'org.apache.kafka.common.errors.TimeoutException: Failed to update metadata after 60000 ms.',
  'java.lang.OutOfMemoryError: Java heap space while parsing large JSON payload.',
  'com.zaxxer.hikari.pool.PoolBase: HikariPool-1 - Failed to validate connection (Connection is closed).',
  'org.springframework.web.client.ResourceAccessException: I/O error on POST request: Connection refused'
];

const LOG_INFO_MESSAGES = [
  'User authentication succeeded for principal with JWT token verified successfully.',
  'Processed batch order checkout event for customer. Payment confirmed via Stripe.',
  'Dispatched notification email via Kafka order-events topic consumer worker.',
  'Health check probe HTTP /actuator/health/readiness responded 200 OK in 4ms.',
  'Garbage collector ZGC completed cycle: 38ms pause time, 420MB reclaimed.',
  'Refreshed tenant configuration from Redis cache for organization acme-corp.'
];

export const DUMMY_LOGS: LogRecord[] = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const isErr = i % 5 === 0 || i === 1;
  const isWarn = !isErr && i % 4 === 0;
  const level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' = isErr ? 'ERROR' : isWarn ? 'WARN' : 'INFO';
  const message = isErr ? LOG_ERROR_MESSAGES[i % LOG_ERROR_MESSAGES.length] :
                  isWarn ? `High resource utilization warning on worker thread #${i % 16}: execution duration > 1200ms` :
                  LOG_INFO_MESSAGES[i % LOG_INFO_MESSAGES.length];

  return {
    id: `log-${String(i).padStart(4, '0')}`,
    serviceName: sName,
    timestamp: new Date(Date.now() - i * 18000).toISOString(),
    level,
    message,
    stackTrace: isErr ? `${message}\n  at com.devops.agent.service.Engine.process(Engine.java:${42 + i % 60})\n  at com.devops.agent.controller.Handler.execute(Handler.java:28)` : undefined,
    traceId: `${(i * 19999123).toString(16).padStart(16, '0')}`,
    spanId: `span-${String(i).padStart(4, '0')}`
  };
});

// ============================================================================
// 3. 200 DUMMY TRACES
// ============================================================================
export const DUMMY_TRACES: TraceSummary[] = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const hasError = i % 5 === 0 || i === 1;
  const totalDurationMs = hasError ? 3000 + (i * 47) % 5000 : 25 + (i * 17) % 220;
  const traceId = `${(i * 29999123).toString(16).padStart(16, '0')}`;
  const now = Date.now() - i * 45000;

  const spans = [
    {
      spanId: `span-root-${i}`,
      parentSpanId: undefined,
      serviceName: sName,
      operationName: 'HTTP POST /api/v1/checkout',
      durationMs: totalDurationMs,
      statusCode: hasError ? 500 : 200,
      isError: hasError,
      startTime: new Date(now).toISOString()
    },
    {
      spanId: `span-sub1-${i}`,
      parentSpanId: `span-root-${i}`,
      serviceName: 'user-service',
      operationName: 'GET /api/v1/users/{id}',
      durationMs: 35,
      statusCode: 200,
      isError: false,
      startTime: new Date(now).toISOString()
    },
    {
      spanId: `span-sub2-${i}`,
      parentSpanId: `span-root-${i}`,
      serviceName: 'payment-service',
      operationName: 'POST /api/v1/payments/process',
      durationMs: Math.max(10, totalDurationMs - 40),
      statusCode: hasError ? 500 : 200,
      isError: hasError,
      startTime: new Date(now + 40).toISOString()
    }
  ];

  return {
    traceId,
    rootService: sName,
    rootEndpoint: i % 2 === 0 ? 'POST /api/v1/orders/checkout' : 'GET /api/v1/payments/charge',
    totalDurationMs,
    totalSpans: spans.length,
    hasErrors: hasError,
    timestamp: new Date(now).toISOString(),
    spans
  };
});

// ============================================================================
// 4. 200 DUMMY KUBERNETES PODS
// ============================================================================
export const DUMMY_PODS: PodInfo[] = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const ns = i % 5 === 0 ? 'staging' : i % 7 === 0 ? 'monitoring' : i % 11 === 0 ? 'kube-system' : 'production';
  const isCrashing = i === 1 || i === 7 || (i % 23 === 0);
  const status = isCrashing ? 'CrashLoopBackOff' : (i % 15 === 0 ? 'Pending' : 'Running');
  const restarts = isCrashing ? 4 + (i % 6) : (i % 8 === 0 ? 1 : 0);
  const ready = status === 'Running' && restarts === 0;

  return {
    name: `${sName}-${(i * 99991).toString(16).substring(0, 8)}-${(i * 12345).toString(16).substring(0, 5)}`,
    namespace: ns,
    status,
    restartCount: restarts,
    nodeName: `ip-10-0-${i % 8}-${10 + (i % 240)}`,
    ip: `10.244.${i % 16}.${10 + (i % 240)}`,
    cpuUsage: `${120 + (i * 23) % 750}m`,
    memoryUsage: `${256 + (i * 47) % 1600}Mi`,
    startTime: new Date(Date.now() - i * 600000).toISOString(),
    ready
  };
});

// ============================================================================
// 5. 200 DUMMY KUBERNETES EVENTS
// ============================================================================
export const DUMMY_K8S_EVENTS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const isWarning = i % 4 === 0 || i === 1;
  const reasons = ['Scheduled', 'Pulled', 'Created', 'Started', 'BackOff', 'Unhealthy', 'ScalingReplicaSet', 'OOMKilling'];
  const reason = isWarning ? reasons[4 + (i % 4)] : reasons[i % 4];

  return {
    type: isWarning ? 'Warning' : 'Normal',
    reason,
    object: `Pod/pod-${String(i).padStart(4, '0')}`,
    message: reason === 'Unhealthy' ? 'Readiness probe failed: HTTP probe failed with statuscode: 500' :
             reason === 'BackOff' ? 'Back-off restarting failed container in pod' :
             reason === 'OOMKilling' ? 'Container memory working set exceeded cgroup limit (exit code 137)' :
             `Successfully assigned pod to worker node ip-10-0-${i % 8}`,
    time: new Date(Date.now() - i * 45000).toISOString()
  };
});

// ============================================================================
// 6. 200 DUMMY DEPLOYMENTS
// ============================================================================
export const DUMMY_DEPLOYMENTS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const author = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`;
  const status = i === 1 ? 'FAILED' : i % 18 === 0 ? 'ROLLED_BACK' : i % 25 === 0 ? 'FAILED' : 'SUCCESS';

  return {
    id: `d1000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
    serviceName: sName,
    version: `v${1 + Math.floor(i / 50)}.${Math.floor((i % 50) / 10)}.${i % 10}`,
    commitSha: (i * 13374241).toString(16).padStart(12, '0'),
    commitMessage: `feat(${sName}): service optimization, DB index tuning & security patch #${1000 + i}`,
    author,
    branch: i % 8 === 0 ? `hotfix/patch-${i}` : 'main',
    status,
    deployedAt: new Date(Date.now() - i * 4 * 3600000).toISOString(),
    pipelineUrl: `https://github.com/acme/${sName}/actions/runs/${1280000 + i}`,
    correlatedIncident: i === 1 ? 'INC-2026-001' : undefined
  };
});

// ============================================================================
// 7. 200 DUMMY REMEDIATION APPROVALS
// ============================================================================
export const DUMMY_REMEDIATION_APPROVALS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const risks: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const actions = [
    `Rollback ${sName} to previous healthy revision`,
    `Rolling restart of ${sName} deployment pods`,
    `Scale HPA target replicas for ${sName} to handle traffic spike`,
    `Flush stale Redis connection handles on ${sName}`
  ];

  return {
    id: `app-0000-0000-${String(i).padStart(8, '0')}`,
    incidentId: `INC-2026-${String(i).padStart(4, '0')}`,
    actionId: `act-${1 + (i % 4)}`,
    actionSummary: actions[i % actions.length],
    riskLevel: risks[i % risks.length],
    parameters: JSON.stringify({ namespace: 'production', target: sName, toRevision: 1 }),
    status: i <= 5 ? 'PENDING' : i % 15 === 0 ? 'REJECTED' : 'APPROVED',
    reviewedBy: i > 5 ? 'Alex Vance (Lead SRE)' : null,
    reviewedAt: i > 5 ? new Date(Date.now() - i * 3600000).toISOString() : null,
    reviewNotes: i > 5 ? 'Validated blast radius against production canary cluster and approved.' : null,
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
  };
});

// ============================================================================
// 8. 200 DUMMY KNOWLEDGE BASE RUNBOOKS
// ============================================================================
const RUNBOOK_TOPICS = [
  'PostgreSQL Connection Pool & HikariCP Tuning Guide',
  'Kubernetes CrashLoopBackOff Troubleshooting Runbook',
  'Kafka Consumer Group Rebalance & Lag Mitigation SOP',
  'Redis Latency Spike & OOM Recovery Runbook',
  'P99 API Latency Degradation Incident Response SOP',
  'Canary Deployment Abort & Rollback Procedure',
  'High CPU Utilization Diagnostics with Async Profiler',
  'Container OOMKilled Analysis & Cgroup Sizing Guide',
  'Database Deadlock Resolution & Indexing Best Practices',
  'Service Mesh mTLS Certificate Rotation Emergency SOP',
  'AWS EKS Node NotReady Triage & Cordon Procedure',
  'Elasticsearch Unassigned Shards Emergency Recovery Runbook',
  'Ingress NGINX 502/504 Gateway Timeout Debugging Guide',
  'Spring Boot Heap Dump Analysis with Eclipse Memory Analyzer',
  'Jaeger Distributed Tracing Bottleneck Localization SOP',
  'Prometheus Alertmanager Notification Routing Configuration',
  'Vault Token Renewal & Secret Leasing Failure Response SOP',
  'Stripe & Third-Party Payment Gateway Outage Playbook',
  'Disaster Recovery Cross-Region Database Failover SOP',
  'Zero-Downtime Database Schema Migration Safe Practices'
];

export const DUMMY_KNOWLEDGE_DOCS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const categories = ['DATABASE', 'INFRASTRUCTURE', 'MESSAGING', 'CACHE', 'NETWORKING', 'DEPLOYMENT', 'SRE'];
  const types = ['RUNBOOK', 'POST_MORTEM', 'ARCHITECTURE_RFC', 'SOP'];
  const category = categories[i % categories.length];
  const doc_type = types[i % types.length];
  const topic = RUNBOOK_TOPICS[i % RUNBOOK_TOPICS.length];
  const title = `${topic} (Edition ${1 + Math.floor(i / 20)}.${i % 20})`;

  return {
    id: `doc-${String(i).padStart(4, '0')}`,
    document_title: title,
    doc_type,
    category,
    content: `# ${title}\n\n## Overview\nProduction-tested operating procedure for triaging and recovering from high-severity ${category.toLowerCase()} degradation.\n\n## Key Diagnostic Indicators\n- Critical metric alert thresholds breached for > 3 minutes\n- Spike in downstream 5xx response status codes\n\n## Action Checklist\n1. Inspect service logs via Loki for top exception signatures.\n2. Verify distributed trace spans in Jaeger to localize bottleneck.\n3. Execute authorized automated remediation rollback or restart.\n4. Validate recovery against health check probes.`,
    similarity_score: Number((0.70 + (i % 28) * 0.01).toFixed(2)),
    updatedAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    metadata: { service: SERVICES[i % SERVICES.length], category }
  };
});

// ============================================================================
// 9. 200 DUMMY INFRASTRUCTURE ITEMS
// ============================================================================
export const DUMMY_INFRASTRUCTURE = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const types = ['POSTGRES_RDS', 'REDIS_CACHE', 'KAFKA_BROKER', 'EKS_WORKER_NODE', 'ALB_INGRESS', 'S3_STORAGE', 'NAT_GATEWAY'];
  const type = types[i % types.length];
  const isDegraded = i === 1 || i % 22 === 0;
  const status = isDegraded ? 'DEGRADED' : 'HEALTHY';

  return {
    id: `infra-${String(i).padStart(4, '0')}`,
    name: `${type.replace(/_/g, ' ')} #${String(i).padStart(3, '0')} (${i % 3 === 0 ? 'us-east-1a' : i % 3 === 1 ? 'us-east-1b' : 'us-east-1c'})`,
    type,
    status,
    details: isDegraded ? 'Connection acquisition queue latency exceeded threshold (>1200ms).' : 'Operational baseline nominal. P99 latency < 15ms.',
    cpu: `${15 + (i * 29) % 75}%`,
    memory: `${25 + (i * 37) % 70}%`,
    isAlert: isDegraded
  };
});

// ============================================================================
// 10. 200 DUMMY TEAM MEMBERS
// ============================================================================
export const DUMMY_TEAM_MEMBERS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const roles = ['SRE_ENGINEER', 'DEVOPS_ENGINEER', 'DEVELOPER', 'ORG_ADMIN', 'VIEWER'];
  const role = i === 1 ? 'SUPER_ADMIN' : roles[i % roles.length];

  return {
    id: `usr-${String(i).padStart(4, '0')}`,
    name: `${fName} ${lName}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@acme.com`,
    role,
    department: i % 4 === 0 ? 'Fintech SRE' : i % 4 === 1 ? 'Core Platform' : i % 4 === 2 ? 'Checkout Team' : 'Infrastructure Squad',
    joined: new Date(Date.now() - (i + 10) * 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: i % 25 === 0 ? 'INACTIVE' : 'ACTIVE'
  };
});

// ============================================================================
// 11. 200 DUMMY AUDIT LOGS
// ============================================================================
export const DUMMY_AUDIT_LOGS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const actions = ['REMEDIATION_APPROVED', 'REMEDIATION_EXECUTED', 'DEPLOYMENT_ROLLBACK', 'INCIDENT_STATUS_CHANGE', 'USER_LOGIN', 'CONFIG_UPDATE', 'ALERT_SUPPRESSED'];
  const actors = ['Alex Vance (Lead SRE)', 'Autonomous Recovery Runner', 'LangGraph SRE Supervisor', 'Sarah Connor (DevOps Lead)', 'Jordan Kim (Security Eng)', 'Elena Rostova (Platform Eng)'];
  const resources = ['deployment/payment-service', 'Rollback payment-service to v4.0.1', 'INC-2026-001 -> INVESTIGATING', 'auth:jwt-issued', 'ConfigMap/service-mesh', 'HPA/order-service-scaler'];

  return {
    id: `aud-${String(i).padStart(4, '0')}`,
    action: actions[i % actions.length],
    actor: actors[i % actors.length],
    resource: resources[i % resources.length],
    ipAddress: `10.244.${i % 255}.${(i * 3) % 255}`,
    timestamp: new Date(Date.now() - i * 180000).toISOString(),
    status: i % 30 === 0 ? 'REJECTED' : 'SUCCESS'
  };
});

// ============================================================================
// 12. 200 DUMMY RCA POST-MORTEM REPORTS
// ============================================================================
export const DUMMY_RCA_REPORTS = Array.from({ length: 200 }, (_, idx) => {
  const i = idx + 1;
  const sName = SERVICES[i % SERVICES.length];
  const topic = INCIDENT_TOPICS[i % INCIDENT_TOPICS.length];

  return {
    id: `rca-${String(i).padStart(4, '0')}`,
    incidentNumber: `INC-2026-${String(i).padStart(4, '0')}`,
    title: `Post-Incident Root Cause Analysis: ${topic} on ${sName}`,
    serviceName: sName,
    detectedAt: new Date(Date.now() - i * 3600000 * 6).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    resolvedAt: new Date(Date.now() - i * 3600000 * 6 + 24 * 60000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    durationMinutes: 15 + (i % 30),
    executiveSummary: `On incident INC-2026-${String(i).padStart(4, '0')}, ${sName} experienced anomalous degradation affecting service throughput. Autonomous LangGraph multi-agent AI identified the root cause within ${(1.8 + (i % 20) * 0.1).toFixed(1)} minutes. Authorized automated remediation restored operations with zero permanent data loss.`,
    rootCauseTechnical: `Detailed telemetry analysis isolated saturation in thread connection handles combined with unindexed database queries under concurrent load. Upstream consumers observed elevated response latencies and HTTP 5xx returns.`,
    lessonsLearned: [
      `Enforce automated pre-flight load testing on all ${sName} canary releases.`,
      `Tune connection acquisition timeout from 30s to 5s with rapid circuit-breaking fallback.`,
      `Add proactive Grafana alert rule for thread contention and worker queue depth.`
    ],
    preventativeActions: [
      { action: `Tune connection pool limits on ${sName}`, owner: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`, status: i % 2 === 0 ? 'COMPLETED' : 'IN_PROGRESS' },
      { action: `Configure ArgoCD automatic rollback on health probe failure`, owner: 'DevOps Platform Team', status: 'COMPLETED' },
      { action: `Update operational runbook with new failure recovery steps`, owner: 'SRE Squad', status: 'COMPLETED' }
    ]
  };
});
