package com.devops.agent.incident;

import java.time.Instant;
import java.util.UUID;

public record IncidentDto(
    UUID id,
    String incidentNumber,
    String title,
    String description,
    String severity,
    String status,
    String source,
    String environment,
    String primaryServiceName,
    String affectedServices,
    String businessImpact,
    Instant detectedAt,
    Instant acknowledgedAt,
    Instant mitigatedAt,
    Instant resolvedAt,
    Instant slaDueAt,
    Instant createdAt
) {
    public static IncidentDto from(Incident i, String serviceName) {
        return new IncidentDto(
            i.getId(),
            i.getIncidentNumber(),
            i.getTitle(),
            i.getDescription(),
            i.getSeverity(),
            i.getStatus(),
            i.getSource(),
            i.getEnvironment(),
            serviceName,
            i.getAffectedServices(),
            i.getBusinessImpact(),
            i.getDetectedAt(),
            i.getAcknowledgedAt(),
            i.getMitigatedAt(),
            i.getResolvedAt(),
            i.getSlaDueAt(),
            i.getCreatedAt()
        );
    }
}
