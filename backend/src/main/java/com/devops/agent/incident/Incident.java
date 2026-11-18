package com.devops.agent.incident;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "primary_service_id")
    private UUID primaryServiceId;

    @Column(name = "incident_number", nullable = false, unique = true, length = 50)
    private String incidentNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String severity = "SEV_2"; // SEV_1, SEV_2, SEV_3, SEV_4

    @Column(nullable = false, length = 50)
    private String status = "DETECTED"; // DETECTED, ACKNOWLEDGED, INVESTIGATING, MITIGATING, RESOLVED, CLOSED

    @Column(nullable = false, length = 50)
    private String source = "AUTOMATIC";

    @Column(nullable = false, length = 100)
    private String fingerprint;

    @Column(name = "affected_services", columnDefinition = "JSONB")
    private String affectedServices = "[]";

    @Column(length = 50)
    private String environment = "production";

    @Column(name = "business_impact", columnDefinition = "TEXT")
    private String businessImpact;

    @Column(name = "slack_channel_url")
    private String slackChannelUrl;

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt = Instant.now();

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "mitigated_at")
    private Instant mitigatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "sla_due_at")
    private Instant slaDueAt;

    public Incident() {}

    public Incident(UUID organizationId, String incidentNumber, String title, String severity, String status, String fingerprint) {
        this.organizationId = organizationId;
        this.incidentNumber = incidentNumber;
        this.title = title;
        this.severity = severity;
        this.status = status;
        this.fingerprint = fingerprint;
        this.detectedAt = Instant.now();
        this.slaDueAt = Instant.now().plusSeconds(3600); // 1 hour default SLA
    }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getPrimaryServiceId() { return primaryServiceId; }
    public void setPrimaryServiceId(UUID primaryServiceId) { this.primaryServiceId = primaryServiceId; }
    public String getIncidentNumber() { return incidentNumber; }
    public void setIncidentNumber(String incidentNumber) { this.incidentNumber = incidentNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getFingerprint() { return fingerprint; }
    public void setFingerprint(String fingerprint) { this.fingerprint = fingerprint; }
    public String getAffectedServices() { return affectedServices; }
    public void setAffectedServices(String affectedServices) { this.affectedServices = affectedServices; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getBusinessImpact() { return businessImpact; }
    public void setBusinessImpact(String businessImpact) { this.businessImpact = businessImpact; }
    public String getSlackChannelUrl() { return slackChannelUrl; }
    public void setSlackChannelUrl(String slackChannelUrl) { this.slackChannelUrl = slackChannelUrl; }
    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Instant getMitigatedAt() { return mitigatedAt; }
    public void setMitigatedAt(Instant mitigatedAt) { this.mitigatedAt = mitigatedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public Instant getSlaDueAt() { return slaDueAt; }
    public void setSlaDueAt(Instant slaDueAt) { this.slaDueAt = slaDueAt; }
}
