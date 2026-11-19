package com.devops.agent.incident;

import jakarta.validation.constraints.NotBlank;

public record UpdateStatusRequest(
    @NotBlank(message = "Status is required")
    String status, // DETECTED, ACKNOWLEDGED, INVESTIGATING, MITIGATING, RESOLVED, CLOSED
    String reason
) {}
