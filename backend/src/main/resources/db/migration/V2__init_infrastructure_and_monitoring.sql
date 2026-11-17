-- V2__init_infrastructure_and_monitoring.sql

-- Environments (e.g. production, staging, development)
CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_production BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, slug)
);

CREATE INDEX idx_environments_org ON environments(organization_id);

-- Kubernetes Clusters
CREATE TABLE IF NOT EXISTS clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    environment_id UUID REFERENCES environments(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'EKS', -- EKS, GKE, AKS, LOCAL_KIND
    region VARCHAR(50),
    api_endpoint VARCHAR(255),
    version VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY', -- HEALTHY, DEGRADED, CRITICAL
    nodes_count INT DEFAULT 1,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clusters_org ON clusters(organization_id);

-- Namespaces
CREATE TABLE IF NOT EXISTS namespaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cluster_id, name)
);

-- Services (Microservices / Applications)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    environment_id UUID REFERENCES environments(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    tier VARCHAR(50) DEFAULT 'TIER_1', -- TIER_1, TIER_2, TIER_3
    repository_url VARCHAR(255),
    health_status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY', -- HEALTHY, DEGRADED, FAILING, UNKNOWN
    current_version VARCHAR(50),
    owner_team VARCHAR(100),
    sla_percentage NUMERIC(5, 2) DEFAULT 99.90,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, slug)
);

CREATE INDEX idx_services_org ON services(organization_id);
CREATE INDEX idx_services_health ON services(health_status);

-- Service Dependencies (Distributed topology graph)
CREATE TABLE IF NOT EXISTS service_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    target_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'SYNC_HTTP', -- SYNC_HTTP, ASYNC_KAFKA, DATABASE, REDIS
    is_critical BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_service_id, target_service_id)
);

-- Infrastructure Resources (Nodes, RDS, Redis, Kafka brokers)
CREATE TABLE IF NOT EXISTS infrastructure_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- K8S_NODE, POSTGRES_RDS, REDIS_CACHE, KAFKA_BROKER
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    cpu_cores NUMERIC(6, 2),
    memory_gb NUMERIC(6, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_infra_resources_org ON infrastructure_resources(organization_id);

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    commit_sha VARCHAR(64) NOT NULL,
    commit_message TEXT,
    author VARCHAR(150),
    branch VARCHAR(100),
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED, IN_PROGRESS, ROLLED_BACK
    deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rollback_target_id UUID REFERENCES deployments(id),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_deployments_service ON deployments(service_id);
CREATE INDEX idx_deployments_date ON deployments(deployed_at);

-- Deployment Events
CREATE TABLE IF NOT EXISTS deployment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- CI_STARTED, BUILD_PASSED, DEPLOY_FAILED, HEALTH_CHECK_FAILED
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring Sources
CREATE TABLE IF NOT EXISTS monitoring_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- PROMETHEUS, LOKI, JAEGER, OPENTELEMETRY, CLOUDWATCH
    endpoint_url VARCHAR(255) NOT NULL,
    auth_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Metric Events (Aggregated time-series snapshots)
CREATE TABLE IF NOT EXISTS metric_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- cpu_utilization, memory_usage, http_500_rate, p99_latency_ms
    metric_value DOUBLE PRECISION NOT NULL,
    threshold_value DOUBLE PRECISION,
    unit VARCHAR(30) DEFAULT '%',
    is_anomalous BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metric_events_service_time ON metric_events(service_id, recorded_at DESC);
CREATE INDEX idx_metric_events_name ON metric_events(metric_name);

-- Log References (Stored pointers to Loki / log entries)
CREATE TABLE IF NOT EXISTS log_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    log_level VARCHAR(20) NOT NULL, -- ERROR, WARN, FATAL
    message TEXT NOT NULL,
    stack_trace TEXT,
    trace_id VARCHAR(100),
    span_id VARCHAR(100),
    labels JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_refs_service_time ON log_references(service_id, timestamp DESC);
CREATE INDEX idx_log_refs_trace ON log_references(trace_id);
CREATE INDEX idx_log_refs_level ON log_references(log_level);

-- Trace References (Distributed tracing references)
CREATE TABLE IF NOT EXISTS trace_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id VARCHAR(100) NOT NULL,
    root_service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    duration_ms INT NOT NULL,
    http_status INT,
    error_count INT DEFAULT 0,
    spans_summary JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_trace_refs_trace_id ON trace_references(trace_id);
