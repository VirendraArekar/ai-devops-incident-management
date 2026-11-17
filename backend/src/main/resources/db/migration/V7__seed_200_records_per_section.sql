-- =============================================================================
-- Migration V7: Seed 200 rich dummy records across every section of the platform
-- =============================================================================

DO $$
DECLARE
    org_id UUID;
    service_ids UUID[];
    service_names TEXT[] := ARRAY['payment-service', 'order-service', 'user-service', 'notification-service'];
    severities TEXT[] := ARRAY['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'];
    statuses TEXT[] := ARRAY['DETECTED', 'INVESTIGATING', 'ACKNOWLEDGED', 'MITIGATING', 'RESOLVED', 'CLOSED'];
    first_names TEXT[] := ARRAY['Alex', 'Sarah', 'Jordan', 'Elena', 'David', 'Maya', 'Liam', 'Priya', 'Marcus', 'Chloe', 'Noah', 'Emma', 'Lucas', 'Mia', 'Ethan', 'Ava', 'Oliver', 'Sophia', 'James', 'Isabella'];
    last_names TEXT[] := ARRAY['Vance', 'Connor', 'Kim', 'Rostova', 'Chen', 'Patel', 'Miller', 'Sharma', 'Aurelius', 'Zhang', 'Dubois', 'Novak', 'Tanaka', 'Morales', 'Berg', 'Kowalski', 'Larsson', 'Silva', 'Schmidt', 'Rossi'];
    titles TEXT[] := ARRAY[
        'Payment Gateway HTTP 500 Spike',
        'Database Connection Pool Exhaustion',
        'Kubernetes Pod CrashLoopBackOff Surge',
        'Order Processing P99 Latency Anomaly',
        'Redis Cluster Master Failover',
        'Kafka Consumer Group Offset Lag Breach',
        'Disk I/O Saturation on Primary Shard',
        'Auth Token Refresh Flow Failure Rate',
        'JVM Metaspace OutOfMemoryError Event',
        'Core Ingress Gateway 504 Timeout',
        'Downstream Stripe Webhook Degradation',
        'Postgres Deadlock Contention on Ledger',
        'Search Index Write Pipeline Stalled',
        'Memory WorkingSet Exceeded Pod Limit',
        'ArgoCD Sync Failure on Canary Rollout',
        'High CPU Utilization Spike on Worker Node',
        'DNS Resolver Latency Spike in EKS',
        'TLS Certificate Expiry Warning Trigger',
        'Circuit Breaker Tripped on Checkout Path',
        'Background Queue Backpressure Surge'
    ];
    runbook_topics TEXT[] := ARRAY[
        'Payment Gateway HikariCP Pool Exhaustion Runbook',
        'PostgreSQL Read Replica Replication Lag Mitigation',
        'Kubernetes CrashLoopBackOff Triage & Pod Recovery',
        'Kafka Partition Rebalance & Consumer Lag Catchup',
        'Redis Cache Cluster Failover & State Rehydration',
        'High Latency P99 Emergency Triage SOP',
        'Automated Canary Rollback SOP',
        'Production Database Out of Disk Recovery Protocol',
        'Microservice Cascading Circuit Breaker Reset',
        'TLS Ingress Certificate Hot-Renewal Procedure',
        'OOMKilled Pod Debugging & Memory Profiling',
        'Elasticsearch Index Shard Unassigned Recovery',
        'AWS EKS Node Group Drain & Scale Protocol',
        'DNS CoreDNS Latency Spike Troubleshooting',
        'Distributed Tracing Missing Span Diagnostics',
        'Zero-Downtime Database Migration Rollback Guide',
        'API Gateway Rate Limiting & DDoS Defense Playbook',
        'Dead Letter Queue Drain & Replay SOP',
        'SRE Incident Commander Rotation & Handoff Playbook',
        'Post-Mortem Root Cause Analysis Reporting Standard'
    ];
    i INT;
    cur_service_id UUID;
    cur_service_name TEXT;
    cur_title TEXT;
    cur_sev TEXT;
    cur_stat TEXT;
    cur_name TEXT;
    cur_email TEXT;
    cur_inc_id UUID;
    inc_ids UUID[] := '{}';
BEGIN
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT array_agg(id) INTO service_ids FROM (SELECT id FROM services ORDER BY name LIMIT 4) s;

    -- =========================================================================
    -- 1. SEED 200 INCIDENTS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_service_id := service_ids[1 + (i % 4)];
        cur_service_name := service_names[1 + (i % 4)];
        cur_title := titles[1 + (i % 20)] || ' on ' || cur_service_name;
        cur_sev := severities[1 + (i % 4)];
        cur_stat := statuses[1 + (i % 6)];
        cur_inc_id := gen_random_uuid();
        inc_ids := array_append(inc_ids, cur_inc_id);

        INSERT INTO incidents (
            id, organization_id, incident_number, title, description,
            severity, status, source, fingerprint, environment,
            primary_service_id, affected_services, business_impact,
            detected_at, acknowledged_at, resolved_at, created_at, updated_at
        ) VALUES (
            cur_inc_id,
            org_id,
            'INC-2026-' || LPAD(i::TEXT, 4, '0'),
            cur_title,
            'Automated detection identified metric threshold violation and anomalous behavior on ' || cur_service_name || '.',
            cur_sev,
            cur_stat,
            CASE WHEN i % 3 = 0 THEN 'DATADOG' WHEN i % 3 = 1 THEN 'PROMETHEUS' ELSE 'AUTOMATIC' END,
            'fp-incident-' || LPAD(i::TEXT, 4, '0'),
            CASE WHEN i % 5 = 0 THEN 'staging' ELSE 'production' END,
            cur_service_id,
            to_jsonb(ARRAY[cur_service_name]),
            CASE WHEN cur_sev = 'SEV_1' THEN 'Direct checkout degradation affecting customer revenue.' ELSE 'Degraded API latency within acceptable SLO margin.' END,
            NOW() - (i * INTERVAL '3 hours'),
            NOW() - (i * INTERVAL '3 hours') + INTERVAL '4 minutes',
            CASE WHEN cur_stat IN ('RESOLVED', 'CLOSED') THEN NOW() - (i * INTERVAL '3 hours') + INTERVAL '32 minutes' ELSE NULL END,
            NOW() - (i * INTERVAL '3 hours'),
            NOW() - (i * INTERVAL '3 hours')
        ) ON CONFLICT (incident_number) DO UPDATE
        SET title = EXCLUDED.title, severity = EXCLUDED.severity, status = EXCLUDED.status;
    END LOOP;

    -- =========================================================================
    -- 2. SEED 200 ALERTS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_service_id := service_ids[1 + (i % 4)];
        cur_service_name := service_names[1 + (i % 4)];
        cur_title := titles[1 + (i % 20)] || ' Alert (' || cur_service_name || ')';
        cur_sev := severities[1 + (i % 4)];

        INSERT INTO alerts (
            id, organization_id, service_id, title, description,
            fingerprint, severity, metric_name, current_value, threshold_value,
            status, starts_at, ends_at
        ) VALUES (
            gen_random_uuid(),
            org_id,
            cur_service_id,
            cur_title,
            'Alert rule threshold breach on ' || cur_service_name || ': metric exceeded critical boundary.',
            'fp-alert-' || LPAD(i::TEXT, 4, '0'),
            cur_sev,
            CASE (i % 6)
                WHEN 0 THEN 'http_500_error_rate'
                WHEN 1 THEN 'hikaricp_connection_timeout_total'
                WHEN 2 THEN 'container_cpu_usage_seconds_total'
                WHEN 3 THEN 'container_memory_working_set_bytes'
                WHEN 4 THEN 'http_request_duration_seconds{quantile="0.99"}'
                ELSE 'kafka_consumergroup_lag'
            END,
            ROUND((50.0 + (i % 45))::NUMERIC, 2),
            ROUND((10.0 + (i % 15))::NUMERIC, 2),
            CASE WHEN i <= 35 THEN 'FIRING' ELSE 'RESOLVED' END,
            NOW() - (i * INTERVAL '2 hours'),
            CASE WHEN i <= 35 THEN NULL ELSE NOW() - (i * INTERVAL '1 hour') END
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- =========================================================================
    -- 3. SEED 200 DEPLOYMENTS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_service_id := service_ids[1 + (i % 4)];
        cur_service_name := service_names[1 + (i % 4)];

        INSERT INTO deployments (
            id, service_id, environment_id,
            commit_sha, commit_message, author, branch,
            version, status, deployed_at
        ) VALUES (
            gen_random_uuid(),
            cur_service_id,
            '50000000-0000-0000-0000-000000000001'::UUID,
            SUBSTRING(MD5('commit-' || i) FROM 1 FOR 12),
            'feat(' || cur_service_name || '): optimize query execution and security patch #' || (1000 + i),
            first_names[1 + (i % 20)] || ' ' || last_names[1 + (i % 20)],
            CASE WHEN i % 8 = 0 THEN 'hotfix/patch-' || i ELSE 'main' END,
            'v' || (1 + i / 50) || '.' || ((i % 50) / 10) || '.' || (i % 10),
            CASE WHEN i % 15 = 0 THEN 'FAILED' WHEN i % 25 = 0 THEN 'ROLLED_BACK' ELSE 'SUCCESS' END,
            NOW() - (i * INTERVAL '4 hours')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- =========================================================================
    -- 4. SEED 200 REMEDIATION APPROVALS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_inc_id := inc_ids[1 + (i % array_length(inc_ids, 1))];

        INSERT INTO remediation_approvals (
            id, organization_id, incident_id, action_id, requested_by, action_summary,
            risk_level, parameters, status, reviewed_at, review_notes,
            created_at, expires_at
        ) VALUES (
            gen_random_uuid(),
            org_id,
            cur_inc_id,
            '80000000-0000-0000-0000-000000000002'::UUID,
            'AI_AGENT',
            'Authorize ' || CASE (i % 4)
                WHEN 0 THEN 'deployment rollback to previous revision'
                WHEN 1 THEN 'pod rollout restart to terminate dead locks'
                WHEN 2 THEN 'horizontal pod autoscaling replica scale-up'
                ELSE 'Redis connection client pool flush'
            END,
            CASE (i % 4) WHEN 0 THEN 'HIGH' WHEN 1 THEN 'LOW' WHEN 2 THEN 'MEDIUM' ELSE 'CRITICAL' END,
            '{"namespace": "production", "target": "payment-service"}',
            CASE WHEN i <= 10 THEN 'PENDING' WHEN i % 12 = 0 THEN 'REJECTED' ELSE 'APPROVED' END,
            CASE WHEN i > 10 THEN NOW() - (i * INTERVAL '3 hours') ELSE NULL END,
            CASE WHEN i > 10 THEN 'Verified impact radius and approved by lead SRE.' ELSE NULL END,
            NOW() - (i * INTERVAL '3 hours'),
            NOW() + INTERVAL '24 hours'
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- =========================================================================
    -- 5. SEED 200 KNOWLEDGE BASE DOCUMENTS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_title := runbook_topics[1 + (i % 20)] || ' (Edition ' || (1 + i / 20) || '.' || (i % 20) || ')';

        INSERT INTO knowledge_documents (
            id, organization_id, title, doc_type, file_name,
            file_type, raw_content, total_chunks, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            org_id,
            cur_title,
            CASE (i % 4)
                WHEN 0 THEN 'RUNBOOK'
                WHEN 1 THEN 'POST_MORTEM'
                WHEN 2 THEN 'ARCHITECTURE_RFC'
                ELSE 'SOP'
            END,
            'doc-' || LPAD(i::TEXT, 4, '0') || '.md',
            'MD',
            '# ' || cur_title || E'\n\n## Summary\nOperational response procedure for high-severity site reliability events.\n\n## Symptoms\n- Elevated error rates and P99 latency breaches\n- Resource saturation across compute and storage\n\n## Recovery Steps\n1. Verify telemetry indicators via Grafana.\n2. Execute automated remediation dry-run.\n3. Rollback or restart affected workloads.',
            3,
            NOW() - (i * INTERVAL '1 day'),
            NOW() - (i * INTERVAL '1 day')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- =========================================================================
    -- 6. SEED 200 USERS & ORGANIZATION MEMBERS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_name := first_names[1 + (i % 20)] || ' ' || last_names[1 + ((i * 3) % 20)];
        cur_email := LOWER(first_names[1 + (i % 20)]) || '.' || LOWER(last_names[1 + ((i * 3) % 20)]) || i || '@acme.com';

        INSERT INTO users (
            id, email, password_hash, full_name, email_verified, status, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            cur_email,
            '$2a$10$XptfskLsT1l/bRTLRiiCgejHqOpgXFreUnNUa35gJdKE2v2FIeio.',
            cur_name,
            true,
            'ACTIVE',
            NOW() - (i * INTERVAL '2 days'),
            NOW() - (i * INTERVAL '2 days')
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- =========================================================================
    -- 7. SEED 200 AUDIT LOGS
    -- =========================================================================
    FOR i IN 1..200 LOOP
        cur_email := LOWER(first_names[1 + (i % 20)]) || '.' || LOWER(last_names[1 + (i % 20)]) || i || '@acme.com';

        INSERT INTO audit_logs (
            id, organization_id, user_email, action, resource_type, resource_id,
            ip_address, created_at
        ) VALUES (
            gen_random_uuid(),
            org_id,
            cur_email,
            CASE (i % 7)
                WHEN 0 THEN 'REMEDIATION_APPROVED'
                WHEN 1 THEN 'REMEDIATION_EXECUTED'
                WHEN 2 THEN 'DEPLOYMENT_ROLLBACK'
                WHEN 3 THEN 'INCIDENT_SEVERITY_ESCALATION'
                WHEN 4 THEN 'USER_AUTHENTICATION'
                WHEN 5 THEN 'CLUSTER_CONFIG_CHANGE'
                ELSE 'ALERT_RULE_MODIFIED'
            END,
            'INCIDENT',
            LPAD(i::TEXT, 8, '0'),
            '10.244.' || (i % 255) || '.' || ((i * 7) % 255),
            NOW() - (i * INTERVAL '15 minutes')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

END $$;
