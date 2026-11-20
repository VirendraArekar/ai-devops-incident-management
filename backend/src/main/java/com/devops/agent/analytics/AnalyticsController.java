package com.devops.agent.analytics;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics & SRE Reporting", description = "Calculate MTTD, MTTA, MTTR, SLA compliance and AI remediation acceptance rates")
public class AnalyticsController {

    @GetMapping("/incidents")
    @Operation(summary = "Get high-level incident frequency and reliability metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIncidentAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "meanTimeToDetectMinutes", 2.4,
                "meanTimeToAcknowledgeMinutes", 4.1,
                "meanTimeToResolveMinutes", 28.5,
                "aiRecommendationAcceptanceRate", 91.5,
                "remediationSuccessRate", 96.2,
                "overallSlaCompliance", 99.92,
                "severityDistribution", List.of(
                        Map.of("severity", "SEV-1 (Critical)", "count", 3, "color", "#ef4444"),
                        Map.of("severity", "SEV-2 (High)", "count", 8, "color", "#f97316"),
                        Map.of("severity", "SEV-3 (Medium)", "count", 14, "color", "#eab308"),
                        Map.of("severity", "SEV-4 (Low)", "count", 6, "color", "#3b82f6")
                ),
                "monthlyTrend", List.of(
                        Map.of("month", "Jun", "incidents", 18, "mttr", 34.0),
                        Map.of("month", "Jul", "incidents", 15, "mttr", 31.2),
                        Map.of("month", "Aug", "incidents", 12, "mttr", 29.0),
                        Map.of("month", "Sep", "incidents", 14, "mttr", 28.5),
                        Map.of("month", "Oct", "incidents", 9, "mttr", 25.1),
                        Map.of("month", "Nov", "incidents", 7, "mttr", 22.8)
                )
        )));
    }

    @GetMapping("/mttr")
    @Operation(summary = "Get Mean Time to Recovery trends broken down by service")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMttrByService() {
        return ResponseEntity.ok(ApiResponse.ok(List.of(
                Map.of("service", "Payment Service", "mttrMinutes", 32.4, "incidentCount", 6, "availability", 99.88),
                Map.of("service", "Order Service", "mttrMinutes", 24.1, "incidentCount", 4, "availability", 99.94),
                Map.of("service", "User Service", "mttrMinutes", 16.5, "incidentCount", 2, "availability", 99.98),
                Map.of("service", "Notification Service", "mttrMinutes", 14.2, "incidentCount", 3, "availability", 99.96)
        )));
    }
}
