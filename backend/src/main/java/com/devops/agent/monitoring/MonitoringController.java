package com.devops.agent.monitoring;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "DevOps Monitoring Dashboard", description = "Real-time metrics, overview counters and health status")
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get high-level infrastructure health, MTTR and active incident counts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.ok(monitoringService.getDashboardOverview()));
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get current telemetry metrics for a service")
    public ResponseEntity<ApiResponse<List<MetricSnapshot>>> getMetrics(
            @RequestParam(defaultValue = "payment-service") String serviceName
    ) {
        return ResponseEntity.ok(ApiResponse.ok(monitoringService.getServiceMetrics(serviceName)));
    }

    @GetMapping("/timeseries")
    @Operation(summary = "Get historical timeseries data for Prometheus charts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTimeSeries(
            @RequestParam(defaultValue = "cpu") String metric,
            @RequestParam(defaultValue = "200") int points
    ) {
        return ResponseEntity.ok(ApiResponse.ok(monitoringService.getHistoricalTimeSeries(metric, points)));
    }
}
