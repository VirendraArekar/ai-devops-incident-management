package com.devops.agent.tracing;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record TraceSpan(
    String spanId,
    String parentSpanId,
    String serviceName,
    String operationName,
    long durationMs,
    int statusCode,
    boolean isError,
    Instant startTime,
    Map<String, String> tags,
    List<String> logs
) {}
