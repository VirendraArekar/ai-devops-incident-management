package com.devops.agent.tracing;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/traces")
@Tag(name = "Distributed Tracing", description = "Query OpenTelemetry / Jaeger traces across microservice call chains")
public class TracingController {

    private final TracingService tracingService;

    public TracingController(TracingService tracingService) {
        this.tracingService = tracingService;
    }

    @GetMapping
    @Operation(summary = "List recent distributed traces with span latency and error status")
    public ResponseEntity<ApiResponse<List<TraceSummary>>> getTraces(
            @RequestParam(required = false) String service,
            @RequestParam(required = false, defaultValue = "false") boolean onlyErrors
    ) {
        return ResponseEntity.ok(ApiResponse.ok(tracingService.getRecentTraces(service, onlyErrors)));
    }

    @GetMapping("/{traceId}")
    @Operation(summary = "Get detailed waterfall spans for a distributed trace")
    public ResponseEntity<ApiResponse<TraceSummary>> getTraceDetails(@PathVariable String traceId) {
        return ResponseEntity.ok(ApiResponse.ok(tracingService.getTraceDetails(traceId)));
    }
}
