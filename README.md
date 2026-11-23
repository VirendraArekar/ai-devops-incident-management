# 🚨 AI-Powered DevOps Incident Management & Autonomous RCA SaaS Platform

[![Java 25](https://img.shields.io/badge/Java-25%20LTS-orange.svg)](https://openjdk.org/projects/jdk/25/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-7.0.0-blue.svg)](https://spring.io/projects/spring-security)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-purple.svg)](https://github.com/langchain-ai/langgraph)
[![React 18](https://img.shields.io/badge/React-18%20%7C%20TypeScript-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, portfolio-ready, AI-powered Site Reliability Engineering (SRE) SaaS platform that autonomously monitors infrastructure, microservices, Kubernetes clusters, deployment pipelines, logs, metrics, and distributed traces. When an incident strikes, the platform automatically detects failures, executes an 8-agent LangGraph investigation DAG, isolates true root causes with zero hallucination, recommends risk-classified remediation, gates sensitive actions with human-in-the-loop approvals, executes recovery via Kubernetes APIs, and generates comprehensive post-incident Root Cause Analysis (RCA) reports.

---

## 📑 Table of Contents

- [Platform UI Gallery (Light & Dark Theme)](#-platform-ui-gallery-light--dark-theme)
- [Key Capabilities](#-key-capabilities)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Multi-Agent AI Investigation Architecture](#-multi-agent-ai-investigation-architecture)
- [Incident Simulation Scenarios](#-incident-simulation-scenarios)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: Full Docker Compose](#option-a-full-docker-compose)
  - [Option B: Local Development](#option-b-local-development)
- [Default Credentials & Access](#-default-credentials--access)
- [Project Structure](#-project-structure)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Kubernetes & GitOps Deployment](#-kubernetes--gitops-deployment)
- [Documentation Catalog](#-documentation-catalog)

---

## 🖼️ Platform UI Gallery (Light & Dark Theme)

The platform features a fully responsive, dual-theme interface with persistent state switching, live navbar dropdown controls (Environment Selector, Notifications Popover, User Profile), and real-time telemetry streaming.

### 1. SRE Observability & Overview (Light Theme)
> Real-time infrastructure telemetry, active incident urgent banners, KPI counters, and microservice health topology.
![SRE Overview](docs/screenshots/overview.png)

### 2. Incident Management & Life Cycle (Light Theme)
> Centralized triage with 200+ seeded multi-severity incidents, full-text search, multi-factor filtering, and direct AI RCA dispatch.
![Incident Management](docs/screenshots/incidents.png)

### 3. Detailed Incident Audit & Evidence (Light Theme)
> Comprehensive incident drilldown featuring audit timeline, correlated telemetry evidence, and operator discussion threads.
![Incident Details](docs/screenshots/incident-detail.png)

### 4. LangGraph Multi-Agent Root Cause Analysis (Light Theme)
> 8-agent orchestrated investigation DAG (Incident, Log, Metrics, Tracing, Deployment, RCA, Remediation, and Reporting agents) strictly grounded in telemetry.
![AI Multi-Agent Investigation](docs/screenshots/ai-investigation.png)

### 5. Autonomous Remediation & Governance (Light Theme)
> Least-privilege human-in-the-loop authorization queue, dry-run simulation, and post-execution health verification audits.
![Remediation Workflow](docs/screenshots/remediation.png)

### 6. Technical Post-Mortem & RCA Reports (Light Theme)
> Executive summary, mechanics explanation, lessons learned, and tracked Jira preventative action items.
![RCA Post-Mortem Report](docs/screenshots/rca-reports.png)

### 7. Centralized Log Explorer — Grafana Loki (Dark Theme)
> **Note:** Dedicated Dark Theme view for high-contrast log indexing, stack trace drilldowns, and anomaly detection.
![Centralized Logs Explorer - Dark Theme](docs/screenshots/logs-explorer.png)

### 8. Cloud Infrastructure Telemetry (Light Theme)
> Real-time resource topology across PostgreSQL connection pools, Redis clusters, EKS nodes, and Kafka streaming brokers.
![Infrastructure Telemetry](docs/screenshots/infrastructure.png)

### 9. Kubernetes Cluster & Pod Health (Light Theme)
> Live AWS EKS pod states, CrashLoopBackOff probes, restart counts, and lifecycle event streaming.
![Kubernetes Cluster Health](docs/screenshots/kubernetes.png)

### 10. Metrics & Distributed Waterfall Traces (Light Theme)
> P99 latency SLA monitoring and OpenTelemetry / Jaeger end-to-end waterfall span bottleneck isolation.
![Metrics & Traces](docs/screenshots/metrics-traces.png)

### 11. CI/CD Deployment Intelligence (Light Theme)
> GitHub Actions release tracking and instant commit-to-incident correlation algorithms.
![CI/CD Deployments](docs/screenshots/deployments.png)

### 12. RAG Semantic Knowledge Base (Light Theme)
> pgvector cosine similarity search over operational runbooks, architecture specs, and past incident post-mortems.
![Knowledge Base RAG](docs/screenshots/knowledge-base.png)

### 13. SRE Reliability Analytics (Light Theme)
> Continuous tracking of MTTD, MTTA, MTTR, AI remediation acceptance rates, and SLA commitments.
![Analytics & SLA](docs/screenshots/analytics.png)

### 14. Enterprise Integrations & Connectors (Light Theme)
> Active connectors for Slack, Microsoft Teams, GitHub Actions, EKS, Prometheus, and Grafana Loki.
![Enterprise Integrations](docs/screenshots/integrations.png)

### 15. Team RBAC & Access Control (Light Theme)
> Organization member management, role assignment (SUPER_ADMIN through VIEWER), and least-privilege policies.
![Team Management](docs/screenshots/team-management.png)

### 16. Security & Compliance Audit Trail (Light Theme)
> Tamper-evident logging of all operator approvals, automated remediation runs, and incident status transitions.
![Audit Logs](docs/screenshots/audit-logs.png)

### 17. Platform & AI Orchestration Settings (Light Theme)
> Multi-model provider configuration (Google Gemini, OpenAI GPT-4o, Local Ollama), safety gates, and notification webhooks.
![Platform Settings](docs/screenshots/settings.png)

---

## ⚡ Key Capabilities

1. **Autonomous Incident Detection Engine:** Threshold and anomaly detection across HTTP 500 surges, latency SLA breaches, HikariCP database pool exhaustion, container OOMKills, pod CrashLoopBackOff, and Kafka consumer group lag with fingerprint-based deduplication and alert correlation.
2. **LangGraph 8-Agent Investigation DAG:** Coordinated multi-agent workflow consisting of Incident Investigation, Log Analysis, Metrics Analysis, Distributed Tracing, Deployment Analysis, Root Cause Analysis, Remediation Planning, and Incident Reporting agents.
3. **Anti-Hallucination & Telemetry Grounding:** All claims and hypotheses generated by the AI are strictly cross-verified against actual Prometheus metrics, Loki log entries, Jaeger trace IDs, and Git commit shas.
4. **pgvector RAG Knowledge Base:** Semantic similarity search over operational runbooks, post-mortems, and historical incident resolutions to guide investigation.
5. **Human-in-the-Loop Safe Remediation:** Strict operational risk classification (LOW, MEDIUM, HIGH, CRITICAL). Dangerous production actions (e.g. deployment rollbacks, pod restarts) require cryptographic approval authorization and dry-run validation.
6. **Enterprise Multi-Tenant Security:** Java 25 & Spring Security 7 stateless JWT architecture with refresh token rotation, BCrypt password hashing, and role-based access control (SUPER_ADMIN, ORG_ADMIN, DEVOPS_ENGINEER, SRE_ENGINEER, DEVELOPER, VIEWER).
7. **16-View Real-Time React Console:** Interactive dashboards for Incidents, Live AI Investigation DAG, Post-Mortem RCA, Infrastructure Health, Kubernetes Cluster Explorer, Unified Logs Explorer, Metrics & Distributed Traces, CI/CD Deployments, Remediation Actions, Knowledge Base RAG, Analytics, Integrations, Team Management, Audit Logs, and Settings.
8. **Interactive Incident Simulator:** Built-in modal and CLI script (`scripts/simulate_incidents.py`) to trigger 8 real-world microservice failure scenarios.

---

## 🏛 System Architecture

The platform follows a modular monolith architecture for business operations paired with a dedicated Python AI orchestration service:

```
+-------------------------------------------------------------------------+
|                  React 18 + Vite + Tailwind CSS Console                 |
|               (16 Views, Live WebSocket Timelines, React Flow)          |
+------------------------------------+------------------------------------+
                                     | HTTP / WS (Port 8080)
                                     v
+-------------------------------------------------------------------------+
|                Spring Boot 4.0 / Java 25 Modular Monolith               |
|                                                                         |
|  +----------------+  +--------------------+  +----------------------+  |
|  | Auth & Org RBAC|  | Incident Detection |  | Monitoring Adapters  |  |
|  +----------------+  +--------------------+  +----------------------+  |
|  +----------------+  +--------------------+  +----------------------+  |
|  | Safe Remediat. |  | Audit & Compliance |  | Alert Correlator     |  |
|  +----------------+  +--------------------+  +----------------------+  |
+-------------------+-----------------+-------------------+---------------+
                    |                 |                   |
                    v                 v                   v
      +-------------------+   +---------------+   +-------------------+
      | PostgreSQL 16     |   | Redis 7       |   | Apache Kafka 3.7  |
      | (pgvector store)  |   | (Locks/Cache) |   | (KRaft Streaming) |
      +-------------------+   +---------------+   +-------------------+
                    |
                    | REST / Events (Port 8000)
                    v
+-------------------------------------------------------------------------+
|                Python 3.12 AI Engine (FastAPI & LangGraph)              |
|                                                                         |
|  +-------------------------+      +----------------------------------+  |
|  | StateGraph Orchestrator |      | 8 Specialized AI Sub-Agents      |  |
|  +-------------------------+      +----------------------------------+  |
|  +-------------------------+      +----------------------------------+  |
|  | pgvector RAG Retriever  |      | Anti-Hallucination Evaluator     |  |
|  +-------------------------+      +----------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 🛠 Technology Stack

### Backend
- **Language & Runtime:** Java 25 LTS (ZGC enabled)
- **Framework:** Spring Boot 4.0.0
- **Security:** Spring Security 7.0.0, JJWT 0.12.6, BCrypt
- **Persistence:** Spring Data JPA, Hibernate, PostgreSQL 16 with pgvector extension
- **Database Migrations:** Flyway 11 (V1 through V6 scripts)
- **Caching & Locks:** Redis 7, Spring Cache
- **Messaging:** Apache Kafka 3.7.0 (KRaft mode)
- **API Documentation:** Springdoc OpenAPI (Swagger UI)

### AI Engine
- **Language & Runtime:** Python 3.12
- **Framework:** FastAPI, Uvicorn, Pydantic v2
- **Agent Orchestration:** LangGraph (StateGraph DAG workflow)
- **LLM Integrations:** Google Gemini 1.5/2.0 API, OpenAI API, Ollama local model support
- **Vector Embeddings & RAG:** pgvector cosine distance search with token semantic projection
- **Verification:** Custom Groundedness & Anti-Hallucination Evaluator

### Frontend
- **Framework:** React 18 with TypeScript and Vite
- **Styling:** Tailwind CSS v4, Lucide React icons
- **State Management:** Zustand, TanStack Query
- **Charts & DAGs:** Recharts, React Flow (Live Agent StateGraph visualization)
- **Networking:** Axios with automated JWT refresh token interceptors, native WebSockets

### DevOps & Observability
- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes 1.28+, Helm 3, ArgoCD GitOps
- **Metrics:** Prometheus 2.51 (Scraping JVM Actuator, AI Engine, Demo Services)
- **Logging:** Grafana Loki 3.0
- **Distributed Tracing:** Jaeger 1.55 (OTLP gRPC/HTTP receiver)
- **Dashboards:** Grafana 10.4 with pre-provisioned datasources

---

## 🤖 Multi-Agent AI Investigation Architecture

The AI investigation runs as a directed acyclic graph (DAG) executed by LangGraph:

```
[Start Incident Trigger]
          |
          v
[1. Incident Investigation Agent] ---> Extracts scope, impact, affected microservices
          |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
[2. Log Analysis Agent]   [3. Metrics Agent]    [4. Tracing Agent]
(Exceptions, Stack traces)  (CPU/RAM baselines)    (Bottlenecks, P99 SLA)
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                                  v
                      [5. Deployment Agent]
                      (Git commit diffs, canary releases, env changes)
                                  |
                                  v
                    [6. Root Cause Analysis Agent]
                    (pgvector RAG similarity, evidence ranking, confidence scoring)
                                  |
                                  v
                  [7. Remediation Planning Agent]
                  (Action generation, risk classification, approval requirements)
                                  |
                                  v
                  [8. Incident Reporting Agent]
                  (Technical post-mortem, executive summary, action items)
                                  |
                                  v
              [Anti-Hallucination Telemetry Verification]
                                  |
                                  v
                            [End / Store]
```

---

## 🚨 Incident Simulation Scenarios

The platform includes an automated incident simulator capable of triggering 8 production failure scenarios:

| ID | Severity | Scenario | Triggered Symptom | Remediation Strategy |
|---|---|---|---|---|
| **1** | `SEV-1` | Payment Service HTTP 500 Surge | 45% HTTP 500 failure rate after deploy `v4.0.2` | Rollback deployment to `v4.0.1` |
| **2** | `SEV-1` | Database Connection Pool Exhaustion | HikariCP pool saturated (20/20 active, 30s timeout) | Scale connection pool / restart pod |
| **3** | `SEV-2` | API P99 Latency SLA Violation | Checkout endpoint latency reaches 4.8s | Enable Redis caching / horizontal scale |
| **4** | `SEV-2` | High CPU Saturation | Order service CPU utilization pegged at 94.2% | Horizontal Pod Autoscaling (HPA) |
| **5** | `SEV-1` | Memory Leak & OOMKilled | Container memory reaches 2.14GB exceeding cgroup limit | Increase memory limit & patch leak |
| **6** | `SEV-1` | Kubernetes CrashLoopBackOff | Liveness probe failures, repeat pod exit code 137 | Pod restart with stable configuration |
| **7** | `SEV-2` | Failed Canary Deployment | Canary v4.0.3 fails 38% synthetic health probes | Automated canary traffic abort |
| **8** | `SEV-3` | Kafka Consumer Group Lag | Notification workers lag exceeds 18,450 records | Scale consumer group partitions |

Trigger any scenario instantly via CLI:
```bash
# List all scenarios
python scripts/simulate_incidents.py --list

# Trigger scenario 1 (Payment HTTP 500)
python scripts/simulate_incidents.py --scenario 1

# Trigger database pool exhaustion
python scripts/simulate_incidents.py --scenario db_exhaustion

# Reset all simulated microservice faults
python scripts/simulate_incidents.py --reset
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker & Docker Compose
- Java 25 & Maven (for local backend compilation)
- Python 3.12 (for local AI engine)
- Node.js 20+ & npm (for local frontend)

### Option A: Full Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/enterprise/devops-incident-platform.git
   cd "devops-incident-platform"
   ```

2. Launch all 11 services in one command:
   ```bash
   docker compose -f deployments/docker-compose.yml up --build -d
   ```

3. Access the web consoles:
   - **Frontend Console:** [http://localhost:5173](http://localhost:5173)
   - **Backend API & Swagger:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **AI Engine Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Prometheus Dashboard:** [http://localhost:9090](http://localhost:9090)
   - **Grafana Observability:** [http://localhost:3000](http://localhost:3000) (admin / admin)
   - **Jaeger Traces UI:** [http://localhost:16686](http://localhost:16686)

### Option B: Local Development

1. **Start Infrastructure Services:**
   ```bash
   docker compose -f deployments/docker-compose.yml up -d postgres redis kafka prometheus loki jaeger
   ```

2. **Start Spring Boot Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Start AI Orchestration Engine:**
   ```bash
   cd ai-engine
   source venv/bin/activate
   uvicorn main:app --port 8000 --reload
   ```

4. **Start React Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🔑 Default Credentials & Access

Pre-seeded database users (ready for immediate login):

| Email | Password | Role | Organization |
|---|---|---|---|
| `admin@enterprise.com` | `password123` | `ORG_ADMIN` | Acme Corp |
| `sre@enterprise.com` | `password123` | `SRE_ENGINEER` | Acme Corp |
| `devops@enterprise.com` | `password123` | `DEVOPS_ENGINEER` | Acme Corp |
| `developer@enterprise.com` | `password123` | `DEVELOPER` | Acme Corp |
| `viewer@enterprise.com` | `password123` | `VIEWER` | Acme Corp |

---

## 📂 Project Structure

```
DevOps Incident Management/
├── backend/                       # Spring Boot 4 / Java 25 Modular Monolith
│   ├── src/main/java/com/devops/agent/
│   │   ├── auth/                  # Authentication & Registration
│   │   ├── security/              # Spring Security 7, JWT, RBAC
│   │   ├── organization/          # Multi-tenant organization isolation
│   │   ├── incident/              # Detection engine, lifecycle, timeline
│   │   ├── alert/                 # Prometheus alert ingestion & rules
│   │   ├── remediation/           # Safe remediation & approval engine
│   │   ├── aiintegration/         # REST client to Python AI engine
│   │   ├── monitoring/            # Metrics ingestion adapter
│   │   ├── logs/                  # Loki log query adapter
│   │   ├── tracing/               # Jaeger distributed trace adapter
│   │   ├── kubernetes/            # K8s cluster management adapter
│   │   ├── deployment/            # CI/CD deployment intelligence
│   │   ├── knowledgebase/         # RAG runbook repository
│   │   ├── analytics/             # MTTR, MTTD, reliability metrics
│   │   └── audit/                 # Tamper-evident audit log
│   ├── src/main/resources/
│   │   ├── db/migration/          # Flyway SQL migrations V1 through V6
│   │   └── application.yml        # Spring Boot configuration
│   └── src/test/java/             # Unit and integration tests
├── ai-engine/                     # Python 3.12 FastAPI + LangGraph AI Service
│   ├── app/
│   │   ├── agents/                # 8 specialized LangGraph agents
│   │   ├── core/                  # Configuration & logging
│   │   ├── models/                # Pydantic schemas (Investigation, RCA)
│   │   ├── rag/                   # pgvector embeddings & retriever
│   │   └── workflow.py            # LangGraph StateGraph DAG definition
│   ├── tests/                     # Pytest suite (DAG & RAG tests)
│   └── main.py                    # FastAPI server entrypoint
├── frontend/                      # React 18 + Vite + Tailwind CSS Console
│   ├── src/
│   │   ├── api/                   # Axios client with JWT refresh interceptor
│   │   ├── components/            # Sidebar (16 tabs), Navbar, Modal, Badges
│   │   ├── pages/                 # 16 complete enterprise console views
│   │   ├── store/                 # Zustand authentication store
│   │   └── types/                 # TypeScript domain interfaces
│   └── nginx.conf                 # Production Nginx reverse proxy
├── demo-services/                 # Microservices for fault simulation
│   ├── user_service/              # User profile service (port 8081)
│   ├── order_service/             # Order checkout orchestrator (port 8082)
│   ├── payment_service/           # Fault-injectable payment API (port 8083)
│   └── notification_service/      # Notification & Kafka lag service (port 8084)
├── deployments/                   # Production & Cloud deployment assets
│   ├── docker-compose.yml         # 11-service local orchestration
│   ├── prometheus/                # Prometheus configuration & alert rules
│   ├── loki/                      # Grafana Loki config
│   ├── grafana/                   # Datasource provisioning
│   ├── kubernetes/                # Production manifests (StatefulSet, HPA, Ingress)
│   ├── helm/                      # Helm chart for Kubernetes deployment
│   └── argocd/                    # GitOps Application CRD
├── scripts/
│   └── simulate_incidents.py      # Zero-dependency incident simulation CLI
└── docs/                          # In-depth architectural documentation
    ├── ARCHITECTURE.md            # Deep-dive system architecture
    ├── AI_AGENT_WORKFLOW.md       # Multi-agent LangGraph specifications
    ├── ER_DIAGRAM.md              # Database schema & Mermaid ER diagram
    ├── SCENARIOS.md               # Incident failure scenario walkthroughs
    └── API_REFERENCE.md           # REST API endpoint reference
```

---

## 🧪 Testing & Quality Assurance

### Run Backend Tests (Java 25)
```bash
cd backend
mvn test
```
*Results:* 7/7 tests passed (JWT token provider, alert deduplication, incident detection engine, safe remediation approval enforcement).

### Run AI Engine Tests (Python 3.12)
```bash
cd ai-engine
source venv/bin/activate
PYTHONPATH=. pytest tests/ -v
```
*Results:* 2/2 tests passed (full 8-agent LangGraph DAG orchestration, pgvector semantic search).

### Run Frontend Typecheck & Build
```bash
cd frontend
npm run build
```
*Results:* Zero TypeScript errors, production bundle compiled with Vite.

---

## ☸️ Kubernetes & GitOps Deployment

### Deploy with Helm
```bash
helm install devops-platform ./deployments/helm/devops-incident-platform \
  --namespace devops-incident-system \
  --create-namespace
```

### Deploy with ArgoCD
```bash
kubectl apply -f deployments/argocd/application.yaml
```

---

## 📚 Documentation Catalog

For detailed documentation, refer to:
- [System Architecture Specification](docs/ARCHITECTURE.md)
- [Multi-Agent LangGraph Workflow Guide](docs/AI_AGENT_WORKFLOW.md)
- [Database Entity-Relationship (ER) Model](docs/ER_DIAGRAM.md)
- [Incident Simulation Scenarios Guide](docs/SCENARIOS.md)
- [REST API Reference Manual](docs/API_REFERENCE.md)
