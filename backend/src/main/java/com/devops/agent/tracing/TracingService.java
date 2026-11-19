package com.devops.agent.tracing;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class TracingService {

    public List<TraceSummary> getRecentTraces(String serviceName, boolean onlyErrors) {
        List<TraceSummary> traces = new ArrayList<>();
        Instant now = Instant.now();

        // Trace 1: Failed checkout trace
        List<TraceSpan> spans1 = List.of(
            new TraceSpan("span-root-1", null, "order-service", "POST /api/v1/orders/checkout", 30450, 500, true, now.minusSeconds(90), Map.of("http.method", "POST", "http.status_code", "500"), List.of("Starting checkout")),
            new TraceSpan("span-sub-1", "span-root-1", "user-service", "GET /api/v1/users/{id}", 45, 200, false, now.minusSeconds(90), Map.of("http.status_code", "200"), List.of("User verified")),
            new TraceSpan("span-sub-2", "span-root-1", "payment-service", "POST /api/v1/payments/charge", 30005, 500, true, now.minusSeconds(89), Map.of("http.status_code", "500", "error", "true"), List.of("HikariPool-1 - Connection is not available, request timed out after 30005ms."))
        );
        traces.add(new TraceSummary("7b3e99f1a2c4e680", "order-service", "POST /api/v1/orders/checkout", 30450, 3, true, now.minusSeconds(90), spans1));

        // Trace 2: Healthy order placement
        List<TraceSpan> spans2 = List.of(
            new TraceSpan("span-root-2", null, "order-service", "GET /api/v1/orders/{id}", 85, 200, false, now.minusSeconds(300), Map.of("http.status_code", "200"), List.of()),
            new TraceSpan("span-sub-3", "span-root-2", "order-service", "SELECT * FROM orders", 30, 200, false, now.minusSeconds(300), Map.of("db.system", "postgresql"), List.of())
        );
        traces.add(new TraceSummary("4f9a0c1e8d2b3a40", "order-service", "GET /api/v1/orders/{id}", 85, 2, false, now.minusSeconds(300), spans2));

        if (onlyErrors) {
            return traces.stream().filter(TraceSummary::hasErrors).toList();
        }
        return traces;
    }

    public TraceSummary getTraceDetails(String traceId) {
        return getRecentTraces(null, false).stream()
                .filter(t -> t.traceId().equalsIgnoreCase(traceId))
                .findFirst()
                .orElse(getRecentTraces(null, false).get(0));
    }
}
