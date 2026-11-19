package com.devops.agent.logs;

public record LogSearchRequest(
    String query,
    String service,
    String level,
    String traceId,
    int limit
) {}
