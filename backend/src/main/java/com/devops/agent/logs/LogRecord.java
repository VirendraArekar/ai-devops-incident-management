package com.devops.agent.logs;

import java.time.Instant;
import java.util.Map;

public record LogRecord(
    String id,
    String serviceName,
    Instant timestamp,
    String level, // ERROR, WARN, INFO, DEBUG
    String message,
    String stackTrace,
    String traceId,
    String spanId,
    Map<String, String> labels
) {}
