package com.devops.agent.tracing;

import java.time.Instant;
import java.util.List;

public record TraceSummary(
    String traceId,
    String rootService,
    String rootEndpoint,
    long totalDurationMs,
    int totalSpans,
    boolean hasErrors,
    Instant timestamp,
    List<TraceSpan> spans
) {}
