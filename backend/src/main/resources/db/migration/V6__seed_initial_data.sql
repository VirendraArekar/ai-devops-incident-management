-- V6__seed_initial_data.sql

-- 1. Insert System Roles
INSERT INTO roles (id, name, description, is_system) VALUES
('00000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'Platform Administrator with unrestricted cross-tenant access', true),
('00000000-0000-0000-0000-000000000002', 'ORG_ADMIN', 'Organization Administrator managing teams and integrations', true),
('00000000-0000-0000-0000-000000000003', 'DEVOPS_ENGINEER', 'DevOps Engineer with deployment and cluster management permissions', true),
('00000000-0000-0000-0000-000000000004', 'SRE_ENGINEER', 'Site Reliability Engineer managing incidents and remediation', true),
('00000000-0000-0000-0000-000000000005', 'DEVELOPER', 'Application Developer with read and trace access', true),
('00000000-0000-0000-0000-000000000006', 'VIEWER', 'Read-only viewer for dashboards and post-mortems', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Permissions
INSERT INTO permissions (id, name, description, category) VALUES
('10000000-0000-0000-0000-000000000001', 'incidents:read', 'View incidents and RCA reports', 'INCIDENTS'),
('10000000-0000-0000-0000-000000000002', 'incidents:write', 'Create and modify incidents', 'INCIDENTS'),
('10000000-0000-0000-0000-000000000003', 'remediation:approve', 'Approve automated recovery workflows', 'REMEDIATION'),
('10000000-0000-0000-0000-000000000004', 'remediation:execute', 'Execute approved remediation actions', 'REMEDIATION'),
('10000000-0000-0000-0000-000000000005', 'ai:investigate', 'Trigger AI multi-agent root cause analysis', 'AI'),
('10000000-0000-0000-0000-000000000006', 'infra:manage', 'Manage clusters, deployments and config', 'INFRASTRUCTURE')
ON CONFLICT (id) DO NOTHING;

-- 3. Default Organization: Acme Cloud
INSERT INTO organizations (id, name, slug, plan_tier, status) VALUES
('20000000-0000-0000-0000-000000000001', 'Acme Cloud Platform', 'acme-corp', 'ENTERPRISE', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Default Users: admin@acme.com and sre@acme.com (password: password123)
-- BCrypt hash for "password123": $2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdKE2v2FIeio.
INSERT INTO users (id, email, password_hash, full_name, email_verified, status) VALUES
('30000000-0000-0000-0000-000000000001', 'admin@acme.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdKE2v2FIeio.', 'Alex Vance (Lead SRE)', true, 'ACTIVE'),
('30000000-0000-0000-0000-000000000002', 'devops@acme.com', '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdKE2v2FIeio.', 'Sarah Connor (DevOps Lead)', true, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 5. Organization Membership
INSERT INTO organization_members (id, organization_id, user_id, role_id, status) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ACTIVE'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 6. Environments
INSERT INTO environments (id, organization_id, name, slug, is_production) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Production US-East', 'production', true),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Staging Europe-West', 'staging', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Kubernetes Clusters
INSERT INTO clusters (id, organization_id, environment_id, name, provider, region, version, status, nodes_count) VALUES
('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'prod-eks-us-east-1', 'EKS', 'us-east-1', 'v1.31.2', 'HEALTHY', 6)
ON CONFLICT (id) DO NOTHING;

-- Namespaces
INSERT INTO namespaces (id, cluster_id, name, status) VALUES
('61000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'production', 'ACTIVE'),
('61000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'monitoring', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 8. Microservices (Demo Services)
INSERT INTO services (id, organization_id, environment_id, name, slug, description, tier, current_version, owner_team, health_status) VALUES
('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'User Service', 'user-service', 'Identity and profile management API', 'TIER_1', 'v2.4.1', 'Identity Team', 'HEALTHY'),
('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Order Service', 'order-service', 'E-commerce cart, checkout and order lifecycle', 'TIER_1', 'v3.1.0', 'Checkout Squad', 'HEALTHY'),
('70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Payment Service', 'payment-service', 'Stripe, PayPal and payment gateway orchestration', 'TIER_1', 'v4.0.2', 'Fintech SRE', 'DEGRADED'),
('70000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Notification Service', 'notification-service', 'Email, SMS and push dispatch via Kafka', 'TIER_2', 'v1.9.0', 'Platform Team', 'HEALTHY')
ON CONFLICT (id) DO NOTHING;

-- 9. Service Dependencies
INSERT INTO service_dependencies (id, source_service_id, target_service_id, dependency_type, is_critical) VALUES
('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'SYNC_HTTP', true),
('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', 'SYNC_HTTP', true),
('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000004', 'ASYNC_KAFKA', false)
ON CONFLICT (id) DO NOTHING;

-- 10. Predefined Remediation Action Templates
INSERT INTO remediation_actions (id, organization_id, name, action_type, target_environment, target_service_id, command_template, parameters_schema, risk_level, requires_approval, is_enabled) VALUES
('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Restart Kubernetes Deployment Pods', 'RESTART_POD', 'production', '70000000-0000-0000-0000-000000000003', 'kubectl rollout restart deployment/payment-service -n production', '{"namespace": "production", "deployment": "payment-service"}', 'LOW', true, true),
('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Rollback Deployment to Previous Healthy ReplicaSet', 'ROLLBACK_DEPLOYMENT', 'production', '70000000-0000-0000-0000-000000000003', 'kubectl rollout undo deployment/payment-service -n production', '{"namespace": "production", "deployment": "payment-service", "toRevision": 1}', 'HIGH', true, true),
('80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Scale Deployment Replicas for Overload Relief', 'SCALE_DEPLOYMENT', 'production', '70000000-0000-0000-0000-000000000002', 'kubectl scale deployment/order-service --replicas=6 -n production', '{"namespace": "production", "deployment": "order-service", "replicas": 6}', 'MEDIUM', true, true),
('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Flush Stale Redis Connection Pool Leaks', 'FLUSH_CONNECTIONS', 'production', '70000000-0000-0000-0000-000000000003', 'redis-cli -h redis CLIENT KILL TYPE normal', '{"clientType": "normal"}', 'HIGH', true, true)
ON CONFLICT (id) DO NOTHING;

-- 11. Initial Knowledge Base Document (Runbook)
INSERT INTO knowledge_documents (id, organization_id, title, doc_type, file_name, file_type, raw_content, total_chunks) VALUES
('90000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Payment Gateway 500 Outage & DB Exhaustion Runbook', 'RUNBOOK', 'runbook-payment-service.md', 'MD',
'# Payment Service Outage Runbook
## Symptoms
- HTTP 500 Spike on `/api/v1/payments/charge`
- HikariPool-1 connection timeout: Connection is not available, request timed out after 30000ms.
- High Redis latency or failed socket connections.

## Root Cause Diagnostics
1. Check recent deployments: Has a new commit modified HikariCP maximumPoolSize or leaked unclosed database connections?
2. Inspect Loki error logs with query: `{app="payment-service"} |= "ConnectionTimeoutException"`.
3. Check Jaeger trace dependency: Are downstream payment webhook calls hanging without HTTP timeouts?

## Mitigation Actions
1. Rolling restart payment-service deployment pods to terminate orphaned connection handles.
2. If triggered immediately after deployment v4.0.2, execute instant rollback to revision 1 (v4.0.1).
3. Scale deployment pods from 2 to 4 if throughput exceeded 500 RPS.', 3)
ON CONFLICT (id) DO NOTHING;

-- Chunks for Document
INSERT INTO knowledge_chunks (id, document_id, chunk_index, content, metadata) VALUES
('91000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 0,
'Payment Gateway Outage Runbook. Symptoms include HTTP 500 spikes on /api/v1/payments/charge, HikariPool connection timeouts, and connection pool exhaustion.', '{"section": "Symptoms", "service": "payment-service"}'),
('91000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', 1,
'Root Cause Diagnostics: Review recent git commits in deployment history for unclosed EntityManager sessions or HikariCP pool exhaustion. Search Loki logs for ConnectionTimeoutException and Jaeger traces for hanging third-party payment requests.', '{"section": "Diagnostics", "service": "payment-service"}'),
('91000000-0000-0000-0000-000000000003', '90000000-0000-0000-0000-000000000001', 2,
'Mitigation & Recovery: Execute safe rolling restart of payment-service pods to release blocked connection handles. If regression followed deployment v4.0.2, initiate immediate rollback to revision 1. Scale pods to 4 if traffic surge detected.', '{"section": "Mitigation", "service": "payment-service"}')
ON CONFLICT (id) DO NOTHING;

-- 12. Seed A Real Active Incident (For Instant Demo Exploration)
INSERT INTO incidents (id, organization_id, primary_service_id, incident_number, title, description, severity, status, source, fingerprint, affected_services, environment, business_impact, detected_at, sla_due_at) VALUES
('a0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', 'INC-2026-001',
'Critical HTTP 500 Surge & HikariPool Exhaustion on Payment Service',
'Automated monitoring detected a sharp spike in HTTP 500 error responses (42.8% error rate) and database connection acquisition timeouts following deployment v4.0.2.',
'SEV_1', 'INVESTIGATING', 'AUTOMATIC', 'fp-payment-500-db-exhaustion',
'["payment-service", "order-service"]', 'production',
'Direct checkout revenue impact: approximately 180 customer transactions failing per minute on checkout flow.',
CURRENT_TIMESTAMP - INTERVAL '12 minutes',
CURRENT_TIMESTAMP + INTERVAL '48 minutes')
ON CONFLICT (id) DO NOTHING;

-- Incident Timeline Events
INSERT INTO incident_events (id, incident_id, event_type, previous_state, new_state, actor_type, actor_name, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'STATUS_CHANGE', NULL, 'DETECTED', 'SYSTEM', 'Prometheus AlertManager', 'Incident automatically created via firing alert Http500ErrorRateSpike (>5%).'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'STATUS_CHANGE', 'DETECTED', 'INVESTIGATING', 'AI_AGENT', 'LangGraph SRE Supervisor', 'Automated multi-agent investigation dispatched across logs, metrics, traces, and git deployments.')
ON CONFLICT (id) DO NOTHING;

-- Incident Evidence
INSERT INTO incident_evidence (id, incident_id, evidence_type, source_reference_id, title, summary, raw_payload, confidence_score) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'METRIC', 'payment-http-500-metric', 'HTTP 500 Spike Metric', 'Error rate escalated from 0.04% to 42.8% within 2 minutes after git commit 4f9e2b1 deployment.', '{"metric": "http_requests_total{status=\"500\"}", "value": 42.8, "unit": "%"}', 0.98),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'LOG', 'log-trace-7b3e99', 'HikariCP Pool Timeout Exception', 'org.postgresql.util.PSQLException: Connection to localhost:5432 refused / HikariPool-1 - Connection is not available, request timed out after 30005ms.', '{"level": "ERROR", "traceId": "7b3e99f1a2c4e680", "exception": "SQLTransientConnectionException"}', 0.99),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'DEPLOYMENT', 'deploy-v4-0-2', 'GitHub Actions Release v4.0.2', 'Commit 4f9e2b1 "Optimize transaction batching" deployed 14 minutes ago by author alex@acme.com.', '{"commitSha": "4f9e2b1c8a01", "version": "v4.0.2", "pipeline": "deploy-prod.yml"}', 0.95)
ON CONFLICT (id) DO NOTHING;
