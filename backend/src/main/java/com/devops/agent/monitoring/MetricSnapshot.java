package com.devops.agent.monitoring;

import java.time.Instant;
import java.util.Map;

public record MetricSnapshot(
    String serviceName,
    String metricName,
    double value,
    String unit,
    double threshold,
    boolean isAnomalous,
    Instant timestamp,
    Map<String, String> tags
) {}
