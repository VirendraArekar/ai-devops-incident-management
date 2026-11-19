package com.devops.agent.incident;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignIncidentRequest(
    @NotNull(message = "Assignee ID is required")
    UUID assigneeId,
    String role
) {}
