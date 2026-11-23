# 🗄 Database Entity-Relationship (ER) Model

The database is built on **PostgreSQL 16** with the **pgvector** extension for semantic vector embeddings. All schemas and baseline seeds are versioned via Flyway migrations (`V1` to `V6`).

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has members"
    ORGANIZATIONS ||--o{ SERVICES : "owns"
    ORGANIZATIONS ||--o{ INCIDENTS : "manages"
    ORGANIZATIONS ||--o{ ALERT_RULES : "configures"
    ORGANIZATIONS ||--o{ REMEDIATION_ACTIONS : "defines"
    ORGANIZATIONS ||--o{ KNOWLEDGE_DOCUMENTS : "maintains"

    SERVICES ||--o{ SERVICE_DEPENDENCIES : "depends on"
    SERVICES ||--o{ DEPLOYMENTS : "deploys"
    SERVICES ||--o{ ALERTS : "generates"
    SERVICES ||--o{ INCIDENTS : "affected in"

    INCIDENTS ||--o{ ALERTS : "correlates"
    INCIDENTS ||--o{ INCIDENT_EVENTS : "timeline"
    INCIDENTS ||--o{ INCIDENT_EVIDENCE : "stores"
    INCIDENTS ||--o{ AI_INVESTIGATION_RUNS : "triggers"
    INCIDENTS ||--o{ RCA_REPORTS : "produces"
    INCIDENTS ||--o{ REMEDIATION_APPROVALS : "authorizes"

    AI_INVESTIGATION_RUNS ||--o{ AI_INVESTIGATION_STEPS : "executes"
    AI_INVESTIGATION_RUNS ||--o{ AI_RECOMMENDATIONS : "suggests"

    REMEDIATION_APPROVALS ||--o{ REMEDIATION_EXECUTIONS : "executes"
    REMEDIATION_ACTIONS ||--o{ REMEDIATION_APPROVALS : "targets"

    KNOWLEDGE_DOCUMENTS ||--o{ KNOWLEDGE_CHUNKS : "chunks"
    USERS ||--o{ AUDIT_LOGS : "acts"

    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar slug
        varchar tier
        timestamp created_at
    }

    USERS {
        uuid id PK
        varchar email
        varchar password_hash
        varchar full_name
        varchar role
        uuid organization_id FK
        boolean is_active
    }

    SERVICES {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar display_name
        varchar tier
        varchar status
        varchar language
        varchar framework
    }

    INCIDENTS {
        uuid id PK
        uuid organization_id FK
        varchar incident_number
        varchar title
        varchar severity
        varchar status
        uuid affected_service_id FK
        varchar fingerprint
        jsonb affected_services
        timestamp detected_at
        timestamp resolved_at
    }

    ALERTS {
        uuid id PK
        uuid organization_id FK
        uuid service_id FK
        varchar title
        varchar fingerprint
        varchar severity
        varchar metric_name
        double current_value
        double threshold_value
        uuid incident_id FK
        varchar status
    }

    RCA_REPORTS {
        uuid id PK
        uuid incident_id FK
        varchar title
        text executive_summary
        text root_cause_analysis
        text contributing_factors
        jsonb action_items
        double confidence_score
        timestamp generated_at
    }

    KNOWLEDGE_CHUNKS {
        uuid id PK
        uuid document_id FK
        integer chunk_index
        text content
        vector_1536 embedding
        jsonb metadata
    }
```

---

## Migration History

- `V1__init_auth_and_organizations.sql`: Multi-tenant organization tables, users, roles, permissions, and refresh tokens.
- `V2__init_infrastructure_and_monitoring.sql`: Environments, clusters, namespaces, services, dependencies, deployments, and metric events.
- `V3__init_alerts_and_incidents.sql`: Alert rules, firing alerts, incident state machine, timeline events, and evidence.
- `V4__init_ai_agents_and_rca.sql`: Multi-agent investigation runs, individual agent steps, RCA post-mortems, and recommendations.
- `V5__init_remediation_and_knowledgebase.sql`: Safe remediation actions, human approvals, execution history, pgvector knowledge docs/chunks, and audit logs.
- `V6__seed_initial_data.sql`: Seeded Acme Corp organization, admin/sre users, demo services, active incident `INC-2026-001`, and runbooks.
