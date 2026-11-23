# 🚨 Incident Failure Scenarios Walkthrough

The platform includes 8 production-grade failure scenarios designed to simulate the most critical real-world DevOps incidents.

---

### Scenario 1: HTTP 500 Error Surge (`http_500`)
- **Service:** `payment-service`
- **Severity:** `SEV-1 (Critical)`
- **Symptom:** Payment processing error rate skyrockets to 44.5% immediately following deployment `v4.0.2`.
- **Root Cause:** Unhandled `NullPointerException` in `PaymentGatewayAdapter.stripeSync()` introduced in commit `b38e029`.
- **Remediation:** Rollback deployment to `v4.0.1`.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 1
  ```

---

### Scenario 2: Database Connection Pool Exhaustion (`db_exhaustion`)
- **Service:** `payment-service`
- **Severity:** `SEV-1 (Critical)`
- **Symptom:** HikariPool active connection count reaches 20/20. Pending connection acquisition queue exceeds 30-second timeout.
- **Root Cause:** Unclosed JDBC ResultSet in payment audit logging interceptor causing connection leakage.
- **Remediation:** Trigger pod restart to flush dead pool locks, scale HikariCP maximumPoolSize to 50, and hotfix connection leak.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 2
  ```

---

### Scenario 3: API P99 Latency SLA Violation (`latency_spike`)
- **Service:** `order-service`
- **Severity:** `SEV-2 (High)`
- **Symptom:** P99 response time for `/api/v1/orders/checkout` escalates to 4.8s (SLO threshold: 1.0s).
- **Root Cause:** Missing database index on `customer_id` column in orders table causing sequential table scan under peak load.
- **Remediation:** Enable Redis query result caching and add concurrent database index.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 3
  ```

---

### Scenario 4: High CPU Saturation (`high_cpu`)
- **Service:** `order-service`
- **Severity:** `SEV-2 (High)`
- **Symptom:** CPU utilization sustained at 94.2% across 2 pods for >120 seconds.
- **Root Cause:** Inefficient regex backtracking in tax calculation validator.
- **Remediation:** Trigger Horizontal Pod Autoscaler (HPA) to scale pods from 2 to 6, then patch regex evaluation.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 4
  ```

---

### Scenario 5: Container Memory Leak & OOMKilled (`oom_killed`)
- **Service:** `payment-service`
- **Severity:** `SEV-1 (Critical)`
- **Symptom:** Container memory reaches 2.14GB exceeding cgroup limit of 2.0GB. Kernel sends SIGKILL (exit code 137).
- **Root Cause:** In-memory caching queue unbounded without eviction policy.
- **Remediation:** Increase Kubernetes memory limits to 3.0GB and configure Redis offloading.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 5
  ```

---

### Scenario 6: Kubernetes Pod CrashLoopBackOff (`crashloop`)
- **Service:** `payment-service`
- **Severity:** `SEV-1 (Critical)`
- **Symptom:** Pod fails liveness probe and repeatedly restarts in `CrashLoopBackOff`.
- **Root Cause:** Environment variable `DB_HOST` misconfigured to unreachable DNS name.
- **Remediation:** Update Kubernetes ConfigMap with correct service endpoint and rollout restart.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 6
  ```

---

### Scenario 7: Failed Canary Deployment (`failed_deployment`)
- **Service:** `payment-service`
- **Severity:** `SEV-2 (High)`
- **Symptom:** Canary release `v4.0.3` fails 38% of synthetic health probes during 10% traffic canary split.
- **Root Cause:** Incompatible schema migration deployed before application update.
- **Remediation:** Automated canary abort, traffic redirect to stable v4.0.2 baseline.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 7
  ```

---

### Scenario 8: Kafka Consumer Group Lag (`kafka_lag`)
- **Service:** `notification-service`
- **Severity:** `SEV-3 (Medium)`
- **Symptom:** Kafka topic `order-events` consumer group `notification-workers` lag builds up to 18,450 records.
- **Root Cause:** Downstream SMTP email gateway rate-limiting batch dispatches.
- **Remediation:** Increase consumer group partition concurrency and enable exponential backoff retry.
- **Trigger:**
  ```bash
  python scripts/simulate_incidents.py --scenario 8
  ```
