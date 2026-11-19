package com.devops.agent.notification;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notification System", description = "Multi-channel incident alerts across Slack, Teams, Email and Webhooks")
public class NotificationController {

    @GetMapping
    @Operation(summary = "List dispatched notifications and delivery statuses")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        Instant now = Instant.now();
        return ResponseEntity.ok(ApiResponse.ok(List.of(
                Map.of("id", "notif-001", "channel", "SLACK", "recipient", "#sre-critical-incidents", "title", "[SEV-1] Critical Payment API HTTP 500 Outage", "status", "SENT", "sentAt", now.minusSeconds(700).toString()),
                Map.of("id", "notif-002", "channel", "TEAMS", "recipient", "Fintech OnCall Channel", "title", "Human Approval Requested: Rollback payment-service", "status", "SENT", "sentAt", now.minusSeconds(200).toString()),
                Map.of("id", "notif-003", "channel", "EMAIL", "recipient", "oncall-lead@acme.com", "title", "Incident INC-2026-001 Assigned to Commander", "status", "SENT", "sentAt", now.minusSeconds(650).toString())
        )));
    }
}
