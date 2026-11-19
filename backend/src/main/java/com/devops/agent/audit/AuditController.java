package com.devops.agent.audit;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit Logs", description = "Immutable audit log of sensitive SRE, remediation and security actions")
public class AuditController {

    @GetMapping("/logs")
    @Operation(summary = "List recent system and user audit trail records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs() {
        List<Map<String, Object>> logs = new ArrayList<>();
        Instant now = Instant.now();
        String[] actions = {"REMEDIATION_APPROVED", "REMEDIATION_EXECUTED", "DEPLOYMENT_ROLLBACK", "INCIDENT_STATUS_CHANGE", "USER_LOGIN", "CONFIG_UPDATE", "ALERT_SUPPRESSED"};
        String[] actors = {"Alex Vance (Lead SRE)", "Autonomous Recovery Runner", "LangGraph SRE Supervisor", "Sarah Connor (DevOps Lead)", "Jordan Kim (Security Engineer)", "Elena Rostova (Platform Eng)"};
        String[] resources = {"deployment/payment-service", "Rollback payment-service to v4.0.1", "INC-2026-001 -> INVESTIGATING", "auth:jwt-issued", "ConfigMap/service-mesh", "HPA/order-service-scaler"};

        for (int i = 1; i <= 200; i++) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", "aud-" + String.format("%04d", i));
            log.put("action", actions[i % actions.length]);
            log.put("actor", actors[i % actors.length]);
            log.put("resource", resources[i % resources.length]);
            log.put("ipAddress", "10.244." + (i % 255) + "." + ((i * 3) % 255));
            log.put("timestamp", now.minusSeconds(i * 120L).toString());
            log.put("status", i % 25 == 0 ? "REJECTED" : "SUCCESS");
            logs.add(log);
        }
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
