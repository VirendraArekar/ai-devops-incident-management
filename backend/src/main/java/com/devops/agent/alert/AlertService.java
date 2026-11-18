package com.devops.agent.alert;

import com.devops.agent.incident.Incident;
import com.devops.agent.incident.IncidentDetectionEngine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final IncidentDetectionEngine detectionEngine;

    public AlertService(AlertRepository alertRepository, IncidentDetectionEngine detectionEngine) {
        this.alertRepository = alertRepository;
        this.detectionEngine = detectionEngine;
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatusOrderByStartsAtDesc("FIRING");
    }

    @Transactional
    public Map<String, Object> triggerSimulatedAlert(String alertScenario) {
        UUID orgId = UUID.fromString("20000000-0000-0000-0000-000000000001");
        Alert alert;

        switch (alertScenario.toLowerCase()) {
            case "db_exhaustion":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "Database Connection Pool Exhaustion on Payment Service",
                        "fp-payment-db-exhaustion",
                        "SEV_1",
                        "hikaricp_connection_timeout_total",
                        48.0,
                        0.0
                );
                alert.setDescription("HikariPool-1 has 0 idle connections out of 20. Pending connection acquisition queue exceeded 30s timeout.");
                break;

            case "crashloop":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "Kubernetes CrashLoopBackOff: payment-service",
                        "fp-payment-k8s-crashloop",
                        "SEV_1",
                        "kube_pod_container_status_waiting_reason{reason=\"CrashLoopBackOff\"}",
                        1.0,
                        0.0
                );
                alert.setDescription("Pod payment-service-7bb5df74bf-9pqlm failed liveness probe and entered CrashLoopBackOff with exit code 137 (OOMKilled).");
                break;

            case "high_cpu":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000002"),
                        "High CPU Utilization Spiking on Order Service",
                        "fp-order-cpu-high",
                        "SEV_2",
                        "container_cpu_usage_seconds_total",
                        94.2,
                        80.0
                );
                alert.setDescription("Order Service CPU consumption sustained at 94.2% across 2 pods for >120 seconds.");
                break;

            case "redis_failure":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "Redis Cache Connection Refused / Latency Spike",
                        "fp-redis-timeout",
                        "SEV_2",
                        "redis_connected_clients",
                        0.0,
                        1.0
                );
                alert.setDescription("Lettuce connection timeout to redis:6379. Idempotency key lookup degraded.");
                break;

            case "kafka_lag":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000004"),
                        "Critical Kafka Consumer Group Lag on Notification Service",
                        "fp-kafka-lag-notification",
                        "SEV_3",
                        "kafka_consumergroup_lag{topic=\"order-events\"}",
                        18450.0,
                        500.0
                );
                alert.setDescription("Kafka topic 'order-events' consumer group 'notification-workers' lag reached 18,450 records.");
                break;

            case "oom_killed":
            case "oom":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "Container OOMKilled Memory Limit Exceeded: payment-service",
                        "fp-payment-oom-killed",
                        "SEV_1",
                        "container_memory_working_set_bytes",
                        2147483648.0,
                        2048000000.0
                );
                alert.setDescription("Payment service container memory reached 2.14GB exceeding cgroup limit 2.0GB. Kernel invoked OOM killer (exit code 137).");
                break;

            case "failed_deployment":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "Failed Canary Deployment: payment-service v4.0.3",
                        "fp-payment-canary-failed",
                        "SEV_2",
                        "deployment_canary_error_rate",
                        38.0,
                        2.0
                );
                alert.setDescription("Canary deployment v4.0.3 failed health checks with 38% synthetic probe failures. Automated rollback recommended.");
                break;

            case "latency_spike":
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000002"),
                        "P99 API Latency Breach on Checkout API",
                        "fp-checkout-p99-latency",
                        "SEV_2",
                        "http_request_duration_seconds{quantile=\"0.99\"}",
                        4800.0,
                        1000.0
                );
                alert.setDescription("P99 response time for /api/v1/orders/checkout reached 4.8s (SLO threshold: 1.0s).");
                break;

            default: // http 500 surge
                alert = new Alert(
                        orgId,
                        UUID.fromString("70000000-0000-0000-0000-000000000003"),
                        "HTTP 500 Error Rate Spike on Payment API",
                        "fp-payment-500-surge",
                        "SEV_1",
                        "http_500_error_rate",
                        44.5,
                        5.0
                );
                alert.setDescription("Payment API HTTP 500 rate escalated to 44.5% (> 5% critical threshold) following deploy v4.0.2.");
                break;
        }

        alert = alertRepository.save(alert);
        Incident incident = detectionEngine.processIncomingAlert(alert);

        Map<String, Object> result = new HashMap<>();
        result.put("alertId", alert.getId());
        result.put("alertTitle", alert.getTitle());
        result.put("incidentId", incident.getId());
        result.put("incidentNumber", incident.getIncidentNumber());
        result.put("severity", incident.getSeverity());
        result.put("status", incident.getStatus());
        result.put("timestamp", Instant.now().toString());

        return result;
    }
}
