package com.devops.agent.incident;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateIncidentRequest(
    @NotBlank(message = "Title is required")
    String title,

    String description,
    String severity, // SEV_1, SEV_2, SEV_3, SEV_4
    UUID primaryServiceId,
    String environment,
    String businessImpact
) {}
