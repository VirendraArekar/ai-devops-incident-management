package com.devops.agent.logs;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/logs")
@Tag(name = "Centralized Log Management", description = "Query Grafana Loki application, container and Kubernetes logs")
public class LogsController {

    private final LogsService logsService;

    public LogsController(LogsService logsService) {
        this.logsService = logsService;
    }

    @GetMapping("/search")
    @Operation(summary = "Search logs with filtering by service, level, query string, and traceId")
    public ResponseEntity<ApiResponse<List<LogRecord>>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "all") String service,
            @RequestParam(required = false, defaultValue = "all") String level,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(logsService.searchLogs(query, service, level, traceId, limit)));
    }

    @GetMapping("/errors")
    @Operation(summary = "Get recurring error clusters across microservices")
    public ResponseEntity<ApiResponse<List<LogRecord>>> getErrors(
            @RequestParam(required = false, defaultValue = "payment-service") String service,
            @RequestParam(required = false, defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(logsService.getRecentErrors(service, limit)));
    }

    @GetMapping("/anomalies")
    @Operation(summary = "Detect anomalous error spikes and correlated trace identifiers")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnomalies() {
        return ResponseEntity.ok(ApiResponse.ok(logsService.getLogAnomalyAnalysis()));
    }
}
