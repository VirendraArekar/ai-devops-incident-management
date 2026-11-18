package com.devops.agent.alert;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
@Tag(name = "Alert Ingestion & Rules", description = "Monitor firing alerts, threshold rules, and simulate incident triggers")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Get all active firing infrastructure alerts")
    public ResponseEntity<ApiResponse<List<Alert>>> getActiveAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(alertService.getActiveAlerts()));
    }

    @PostMapping("/simulate")
    @Operation(summary = "Simulate an alert scenario for testing or interviewer demonstration (e.g. 500_surge, db_exhaustion, crashloop, high_cpu, redis_failure, kafka_lag, latency_spike)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateAlert(
            @RequestParam(defaultValue = "500_surge") String scenario
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Alert simulated and processed by detection engine", alertService.triggerSimulatedAlert(scenario)));
    }
}
