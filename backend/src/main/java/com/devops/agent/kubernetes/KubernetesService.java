package com.devops.agent.kubernetes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class KubernetesService {

    private static final Logger log = LoggerFactory.getLogger(KubernetesService.class);

    public ClusterHealth getClusterHealth() {
        return new ClusterHealth(
                "prod-eks-us-east-1",
                "AWS EKS",
                "v1.31.2",
                "DEGRADED",
                6,
                6,
                48,
                2,
                Map.of("cpuAllocated", "68%", "memoryAllocated", "79%", "storageAllocated", "54%"),
                List.of(
                        "Pod payment-service-7bb5df74bf-2x9la has restarted 4 times in the last 15 minutes",
                        "High memory pressure detected on worker node ip-10-0-3-142.ec2.internal"
                )
        );
    }

    public List<PodInfo> getPods(String namespace) {
        List<PodInfo> pods = new ArrayList<>();
        Instant now = Instant.now();
        String[] services = {"payment-service", "order-service", "user-service", "notification-service", "ingress-controller", "redis-cluster", "kafka-broker", "prometheus-k8s", "loki-gateway"};
        String[] namespaces = {"production", "production", "production", "staging", "monitoring", "kube-system"};
        String[] statuses = {"Running", "Running", "Running", "Running", "CrashLoopBackOff", "Pending", "Completed"};

        for (int i = 1; i <= 200; i++) {
            String sName = services[i % services.length];
            String ns = (namespace != null && !namespace.isBlank() && !"all".equalsIgnoreCase(namespace)) ? namespace : namespaces[i % namespaces.length];
            String stat = (i == 1 || i == 7) ? "CrashLoopBackOff" : statuses[i % statuses.length];
            int restarts = stat.equals("CrashLoopBackOff") ? 4 + (i % 6) : (i % 8 == 0 ? 1 : 0);
            boolean isReady = "Running".equals(stat) && restarts == 0;
            String cpu = (100 + (i * 23) % 800) + "m";
            String memory = (256 + (i * 47) % 1500) + "Mi";

            pods.add(new PodInfo(
                    sName + "-" + String.format("%08x", (long) i * 99991).substring(0, 8) + "-" + String.format("%05x", (long) i * 12345).substring(0, 5),
                    ns,
                    stat,
                    restarts,
                    "ip-10-0-" + (i % 8) + "-" + (10 + (i % 240)),
                    "10.244." + (i % 16) + "." + (10 + (i % 240)),
                    cpu,
                    memory,
                    now.minusSeconds(i * 300L),
                    isReady
            ));
        }
        return pods;
    }

    public List<DeploymentInfo> getDeployments(String namespace) {
        return List.of(
                new DeploymentInfo("payment-service", "production", 2, 0, 2, 0, "acme/payment-service:v4.0.2", "RollingUpdate", "DEGRADED"),
                new DeploymentInfo("order-service", "production", 4, 4, 4, 4, "acme/order-service:v3.1.0", "RollingUpdate", "HEALTHY"),
                new DeploymentInfo("user-service", "production", 2, 2, 2, 2, "acme/user-service:v2.4.1", "RollingUpdate", "HEALTHY"),
                new DeploymentInfo("notification-service", "production", 2, 2, 2, 2, "acme/notification-service:v1.9.0", "RollingUpdate", "HEALTHY"),
                new DeploymentInfo("ingress-nginx-controller", "ingress", 3, 3, 3, 3, "registry.k8s.io/ingress-nginx:v1.10.0", "RollingUpdate", "HEALTHY"),
                new DeploymentInfo("prometheus-server", "monitoring", 1, 1, 1, 1, "prom/prometheus:v2.51.0", "Recreate", "HEALTHY"),
                new DeploymentInfo("loki", "monitoring", 1, 1, 1, 1, "grafana/loki:3.0.0", "Recreate", "HEALTHY"),
                new DeploymentInfo("jaeger-collector", "monitoring", 1, 1, 1, 1, "jaegertracing/all-in-one:1.55", "Recreate", "HEALTHY")
        );
    }

    public List<Map<String, Object>> getKubernetesEvents(String namespace) {
        List<Map<String, Object>> events = new ArrayList<>();
        Instant now = Instant.now();
        String[] types = {"Normal", "Warning", "Normal", "Normal", "Warning"};
        String[] reasons = {"Scheduled", "Pulled", "Created", "Started", "BackOff", "Unhealthy", "ScalingReplicaSet", "OOMKilling"};

        for (int i = 1; i <= 200; i++) {
            String type = types[i % types.length];
            String reason = reasons[i % reasons.length];
            events.add(Map.of(
                    "type", type,
                    "reason", reason,
                    "object", "Pod/pod-" + String.format("%04d", i),
                    "message", reason.equals("Unhealthy") ? "Readiness probe failed HTTP 500" :
                               reason.equals("BackOff") ? "Back-off restarting failed container in pod" :
                               reason.equals("OOMKilling") ? "Memory cgroup out of memory limit reached (exit 137)" :
                               "Successfully assigned pod to node ip-10-0-" + (i % 6),
                    "time", now.minusSeconds(i * 60L).toString()
            ));
        }
        return events;
    }

    public Map<String, Object> executePodRestart(String namespace, String deploymentName) {
        log.info("Executing rolling restart for deployment {} in namespace {}", deploymentName, namespace);
        return Map.of(
                "action", "ROLLOUT_RESTART",
                "target", deploymentName,
                "namespace", namespace,
                "status", "INITIATED",
                "message", "deployment.apps/" + deploymentName + " restarted",
                "timestamp", Instant.now().toString()
        );
    }

    public Map<String, Object> executeScale(String namespace, String deploymentName, int replicas) {
        log.info("Scaling deployment {} in namespace {} to {} replicas", deploymentName, namespace, replicas);
        return Map.of(
                "action", "SCALE",
                "target", deploymentName,
                "namespace", namespace,
                "desiredReplicas", replicas,
                "status", "SUCCESS",
                "message", "deployment.apps/" + deploymentName + " scaled to " + replicas,
                "timestamp", Instant.now().toString()
        );
    }

    public Map<String, Object> executeRollback(String namespace, String deploymentName) {
        log.info("Executing rollback for deployment {} in namespace {}", deploymentName, namespace);
        return Map.of(
                "action", "ROLLOUT_UNDO",
                "target", deploymentName,
                "namespace", namespace,
                "status", "SUCCESS",
                "message", "deployment.apps/" + deploymentName + " rolled back to previous revision",
                "timestamp", Instant.now().toString()
        );
    }
}
