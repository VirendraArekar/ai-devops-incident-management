# 📖 REST API Reference Manual

Base URL: `http://localhost:8080/api/v1`

All requests (except authentication endpoints) require a JWT bearer token in the `Authorization` header:
`Authorization: Bearer <accessToken>`

---

## 1. Authentication & Organization Management (`/auth`, `/organizations`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate user with email and password | Public |
| `POST` | `/auth/register` | Register a new tenant admin and organization | Public |
| `POST` | `/auth/refresh` | Rotate expired access token using refresh token | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile & permissions | Any Authenticated |
| `GET` | `/organizations/current` | Get organization details, members, and tier | `ORG_ADMIN`, `SUPER_ADMIN` |

---

## 2. Incident Management (`/incidents`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/incidents` | List incidents with optional status/severity filters | All Roles |
| `GET` | `/incidents/{id}` | Get full incident detail, timeline, and evidence | All Roles |
| `POST` | `/incidents/{id}/acknowledge` | Acknowledge incident (transitions status) | SRE, DevOps, Admin |
| `POST` | `/incidents/{id}/resolve` | Mark incident resolved with resolution notes | SRE, DevOps, Admin |
| `GET` | `/incidents/{id}/timeline` | Fetch chronological event timeline | All Roles |
| `GET` | `/incidents/{id}/evidence` | Fetch correlated log, metric, and trace evidence | All Roles |

---

## 3. Alerts & Incident Detection (`/alerts`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/alerts` | Get list of currently firing alerts | All Roles |
| `POST` | `/alerts/simulate` | Ingest simulated alert and trigger correlation | All Roles |

---

## 4. Multi-Agent AI Investigation & RCA (`/ai`, `/ai-engine`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `POST` | `/ai/investigate/{incidentId}` | Trigger LangGraph 8-agent investigation DAG | SRE, DevOps, Admin |
| `GET` | `/ai/investigate/{incidentId}/runs` | Fetch investigation runs and agent steps | All Roles |
| `GET` | `/ai/rca/{incidentId}` | Fetch post-incident Root Cause Analysis report | All Roles |

---

## 5. Remediation & Approvals (`/remediation`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/remediation/actions` | List configured automated recovery actions | All Roles |
| `GET` | `/remediation/approvals` | List pending/approved remediation requests | All Roles |
| `POST` | `/remediation/request-approval` | Request human authorization for high-risk action | SRE, AI Agent |
| `POST` | `/remediation/approvals/{id}/approve` | Grant approval for remediation action | `ORG_ADMIN`, `SRE_ENGINEER` |
| `POST` | `/remediation/approvals/{id}/reject` | Reject remediation action with reason | `ORG_ADMIN`, `SRE_ENGINEER` |
| `POST` | `/remediation/approvals/{id}/execute` | Execute approved remediation against cluster | `ORG_ADMIN`, `SRE_ENGINEER` |

---

## 6. Observability & Infrastructure (`/monitoring`, `/logs`, `/traces`, `/kubernetes`)

| Method | Endpoint | Description | Roles Allowed |
|---|---|---|---|
| `GET` | `/monitoring/metrics/summary` | Get real-time infrastructure metrics (CPU/RAM/IO) | All Roles |
| `GET` | `/logs/search` | Search Loki logs with severity/service filters | All Roles |
| `GET` | `/traces/service/{serviceName}` | Fetch Jaeger distributed trace spans | All Roles |
| `GET` | `/kubernetes/pods` | List Kubernetes pods with status and health | All Roles |
| `GET` | `/deployments` | List recent CI/CD deployments and commit shas | All Roles |
| `GET` | `/analytics/overview` | Fetch MTTR, MTTD, and reliability metrics | All Roles |
| `GET` | `/audit/logs` | Fetch immutable compliance audit logs | `ORG_ADMIN`, `SUPER_ADMIN` |
