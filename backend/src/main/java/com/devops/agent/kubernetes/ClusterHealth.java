package com.devops.agent.kubernetes;

import java.util.List;
import java.util.Map;

public record ClusterHealth(
    String clusterName,
    String provider,
    String version,
    String status,
    int totalNodes,
    int readyNodes,
    int totalPods,
    int failingPods,
    Map<String, String> resourceUtilization,
    List<String> activeWarnings
) {}
