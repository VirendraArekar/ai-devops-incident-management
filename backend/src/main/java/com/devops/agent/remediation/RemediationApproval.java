package com.devops.agent.remediation;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "remediation_approvals")
public class RemediationApproval extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "action_id")
    private UUID actionId;

    @Column(name = "requested_by", nullable = false, length = 150)
    private String requestedBy = "AI_AGENT";

    @Column(name = "action_summary", nullable = false, columnDefinition = "TEXT")
    private String actionSummary;

    @Column(name = "risk_level", nullable = false, length = 30)
    private String riskLevel = "MEDIUM";

    @Column(columnDefinition = "JSONB")
    private String parameters = "{}";

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, EXPIRED

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt = Instant.now().plusSeconds(3600);

    public RemediationApproval() {}

    public RemediationApproval(UUID organizationId, UUID incidentId, UUID actionId, String actionSummary, String riskLevel, String parameters) {
        this.organizationId = organizationId;
        this.incidentId = incidentId;
        this.actionId = actionId;
        this.actionSummary = actionSummary;
        this.riskLevel = riskLevel;
        this.parameters = parameters;
        this.status = "PENDING";
        this.expiresAt = Instant.now().plusSeconds(3600);
    }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }
    public UUID getActionId() { return actionId; }
    public void setActionId(UUID actionId) { this.actionId = actionId; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getActionSummary() { return actionSummary; }
    public void setActionSummary(String actionSummary) { this.actionSummary = actionSummary; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(UUID reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
