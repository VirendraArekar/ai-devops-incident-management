-- V3__init_alerts_and_incidents.sql

-- Alert Rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50) NOT NULL, -- CPU, MEMORY, HTTP_500, LATENCY_P99, CRASHLOOP, DISK
    condition_operator VARCHAR(20) NOT NULL, -- GREATER_THAN, LESS_THAN, EQUALS
    threshold_value DOUBLE PRECISION NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 60,
    severity VARCHAR(30) NOT NULL DEFAULT 'SEV_2', -- SEV_1, SEV_2, SEV_3, SEV_4
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_org ON alert_rules(organization_id);

-- Alerts (Incoming alerts from Prometheus / Loki / K8s)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    fingerprint VARCHAR(100) NOT NULL, -- Alert deduplication & grouping fingerprint
    description TEXT,
    severity VARCHAR(30) NOT NULL DEFAULT 'SEV_2',
    status VARCHAR(50) NOT NULL DEFAULT 'FIRING', -- FIRING, RESOLVED, SUPPRESSED
    source VARCHAR(50) NOT NULL DEFAULT 'PROMETHEUS', -- PROMETHEUS, LOKI, KUBERNETES, SENTRY
    metric_name VARCHAR(100),
    current_value DOUBLE PRECISION,
    threshold_value DOUBLE PRECISION,
    labels JSONB DEFAULT '{}',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP WITH TIME ZONE,
    incident_id UUID -- populated when correlated into an incident
);

CREATE INDEX idx_alerts_fingerprint ON alerts(fingerprint);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_org ON alerts(organization_id);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    incident_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. INC-2026-001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(30) NOT NULL DEFAULT 'SEV_2', -- SEV_1 (Critical), SEV_2 (High), SEV_3 (Medium), SEV_4 (Low)
    status VARCHAR(50) NOT NULL DEFAULT 'DETECTED', -- DETECTED, ACKNOWLEDGED, INVESTIGATING, MITIGATING, RESOLVED, CLOSED
    source VARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC', -- AUTOMATIC, MANUAL, WEBHOOK
    fingerprint VARCHAR(100) NOT NULL,
    affected_services JSONB DEFAULT '[]', -- List of service IDs/names affected
    environment VARCHAR(50) DEFAULT 'production',
    business_impact TEXT,
    slack_channel_url VARCHAR(255),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    mitigated_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    sla_due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_org ON incidents(organization_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_detected ON incidents(detected_at DESC);
CREATE INDEX idx_incidents_fingerprint ON incidents(fingerprint);

-- Add foreign key back to alerts for correlated incident
ALTER TABLE alerts ADD CONSTRAINT fk_alerts_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL;

-- Incident Events (Complete Audit Timeline: DETECTED -> ACKNOWLEDGED -> INVESTIGATING -> etc.)
CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- STATUS_CHANGE, SEVERITY_CHANGE, AI_INVESTIGATION_STARTED, REMEDIATION_TRIGGERED, ASSIGNMENT, COMMENT_ADDED
    previous_state VARCHAR(100),
    new_state VARCHAR(100),
    actor_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM', -- SYSTEM, AI_AGENT, USER
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_events_incident ON incident_events(incident_id, created_at ASC);

-- Incident Assignments
CREATE TABLE IF NOT EXISTS incident_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_role VARCHAR(50) DEFAULT 'COMMANDER', -- COMMANDER, INVESTIGATOR, COMMUNICATIONS
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Incident Comments
CREATE TABLE IF NOT EXISTS incident_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Incident Evidence (Traceable logs, metrics, traces, deployment events)
CREATE TABLE IF NOT EXISTS incident_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL, -- LOG, METRIC, TRACE, DEPLOYMENT, K8S_EVENT
    source_reference_id VARCHAR(150), -- e.g. traceId, logId, deploymentId
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    raw_payload JSONB DEFAULT '{}',
    confidence_score DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_evidence_incident ON incident_evidence(incident_id);
