-- V5__init_remediation_and_knowledgebase.sql

-- Enable pgvector if available; fallback to standard float array / text if not installed
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension not installed or permission restricted. Falling back to native storage.';
END $$;

-- Predefined Remediation Actions
CREATE TABLE IF NOT EXISTS remediation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- RESTART_POD, SCALE_DEPLOYMENT, ROLLBACK_DEPLOYMENT, RESTART_SERVICE, FLUSH_REDIS, REPROCESS_KAFKA
    target_environment VARCHAR(50) NOT NULL DEFAULT 'production',
    target_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    command_template VARCHAR(255) NOT NULL, -- strictly whitelisted template, NOT arbitrary shell
    parameters_schema JSONB DEFAULT '{}',
    risk_level VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    is_enabled BOOLEAN NOT NULL DEFAULT false, -- Defaults to disabled for security!
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Remediation Approvals (Strict Human-in-the-Loop approval)
CREATE TABLE IF NOT EXISTS remediation_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE SET NULL,
    action_id UUID REFERENCES remediation_actions(id) ON DELETE SET NULL,
    requested_by VARCHAR(150) NOT NULL DEFAULT 'AI_AGENT',
    action_summary TEXT NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    parameters JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_remediation_approvals_org ON remediation_approvals(organization_id);
CREATE INDEX idx_remediation_approvals_status ON remediation_approvals(status);

-- Remediation Executions (Dry-run and Live Execution with before/after state)
CREATE TABLE IF NOT EXISTS remediation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID REFERENCES remediation_approvals(id) ON DELETE SET NULL,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    is_dry_run BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING', -- RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ROLLED_BACK
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    before_state JSONB DEFAULT '{}',
    after_state JSONB DEFAULT '{}',
    execution_logs TEXT,
    recovery_verified BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_remediation_exec_incident ON remediation_executions(incident_id);

-- Knowledge Base Documents (Runbooks, Post-mortems, Architecture Docs)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL DEFAULT 'RUNBOOK', -- RUNBOOK, RCA_REPORT, ARCHITECTURE, POST_MORTEM
    file_name VARCHAR(255),
    file_type VARCHAR(20) NOT NULL DEFAULT 'MD', -- PDF, DOCX, MD, TXT
    raw_content TEXT,
    total_chunks INT DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_docs_org ON knowledge_documents(organization_id);

-- Knowledge Base Chunks (With Vector Embeddings)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding_json JSONB DEFAULT '[]', -- Fallback JSON representation of 768-dim float vector
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_chunks_doc ON knowledge_chunks(document_id);

-- Add vector column conditionally if pgvector exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
        ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);
        CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    END IF;
END $$;

-- Notifications (Multi-channel dispatch: Slack, Teams, Email, Webhook)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL, -- SLACK, TEAMS, EMAIL, WEBHOOK
    recipient VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, RETRYING
    retry_count INT DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_incident ON notifications(incident_id);

-- Integrations (Slack, GitHub, K8s, Prometheus, Loki)
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- SLACK, GITHUB, KUBERNETES, PROMETHEUS, LOKI, PAGERDUTY
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    config JSONB DEFAULT '{}', -- encrypted webhook URLs, tokens, cluster configs
    last_health_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integrations_org ON integrations(organization_id);

-- Audit Logs (Tamper-evident trail for every sensitive action)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- USER_LOGIN, REMEDIATION_APPROVED, REMEDIATION_EXECUTED, INCIDENT_SEVERITY_CHANGED, etc.
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
