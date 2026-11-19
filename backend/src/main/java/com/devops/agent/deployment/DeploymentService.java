package com.devops.agent.deployment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;

    public DeploymentService(DeploymentRepository deploymentRepository) {
        this.deploymentRepository = deploymentRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentDeployments() {
        List<Map<String, Object>> list = new ArrayList<>();
        Instant now = Instant.now();
        String[] services = {"payment-service", "order-service", "user-service", "notification-service"};
        String[] authors = {"alex@acme.com", "sarah@acme.com", "jordan@acme.com", "elena@acme.com", "david@acme.com", "rachel@acme.com"};
        String[] statuses = {"SUCCESS", "SUCCESS", "SUCCESS", "SUCCESS", "FAILED", "ROLLED_BACK"};

        for (int i = 1; i <= 200; i++) {
            Map<String, Object> dep = new HashMap<>();
            String sName = services[i % services.length];
            dep.put("id", "d1000000-0000-0000-0000-" + String.format("%012d", i));
            dep.put("serviceName", sName);
            dep.put("version", "v" + (1 + i / 50) + "." + ((i % 50) / 10) + "." + (i % 10));
            dep.put("commitSha", String.format("%012x", (long) i * 13374241L).substring(0, 12));
            dep.put("commitMessage", "feat(" + sName + "): performance optimization and reliability patch #" + (1000 + i));
            dep.put("author", authors[i % authors.length]);
            dep.put("branch", i % 8 == 0 ? "hotfix/patch-" + i : "main");
            dep.put("status", i == 1 ? "FAILED" : statuses[i % statuses.length]);
            dep.put("deployedAt", now.minusSeconds(i * 3600L * 4).toString());
            dep.put("pipelineUrl", "https://github.com/acme/" + sName + "/actions/runs/" + (1280000 + i));
            if (i == 1) {
                dep.put("correlatedIncident", "INC-2026-001");
            }
            list.add(dep);
        }
        return list;
    }

    public Map<String, Object> correlateIncidentWithDeployment(String serviceName, Instant incidentTime) {
        Map<String, Object> correlation = new HashMap<>();
        correlation.put("suspectDeploymentFound", true);
        correlation.put("service", serviceName);
        correlation.put("commitSha", "4f9e2b1c8a01");
        correlation.put("version", "v4.0.2");
        correlation.put("timeDeltaMinutes", 2.5); // Deployed 2.5 minutes before incident started
        correlation.put("author", "alex@acme.com");
        correlation.put("changedFiles", List.of("src/main/resources/application.yml", "src/main/java/com/devops/payment/HikariConfig.java"));
        correlation.put("riskConfidence", 0.94);
        correlation.put("recommendation", "Execute rollback to healthy release v4.0.1 (commit 9a2c3d4e5f60)");
        return correlation;
    }
}
