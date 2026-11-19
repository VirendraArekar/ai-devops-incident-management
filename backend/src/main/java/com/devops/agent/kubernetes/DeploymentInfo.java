package com.devops.agent.kubernetes;

public record DeploymentInfo(
    String name,
    String namespace,
    int replicas,
    int readyReplicas,
    int updatedReplicas,
    int availableReplicas,
    String image,
    String strategy,
    String status // HEALTHY, PROGRESSING, DEGRADED
) {}
