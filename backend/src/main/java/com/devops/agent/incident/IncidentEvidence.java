package com.devops.agent.incident;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "incident_evidence")
public class IncidentEvidence extends BaseEntity {

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "evidence_type", nullable = false, length = 50)
    private String evidenceType; // LOG, METRIC, TRACE, DEPLOYMENT, K8S_EVENT

    @Column(name = "source_reference_id", length = 150)
    private String sourceReferenceId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "confidence_score")
    private Double confidenceScore = 1.0;

    public IncidentEvidence() {}

    public IncidentEvidence(UUID incidentId, String evidenceType, String sourceReferenceId, String title, String summary, Double confidenceScore) {
        this.incidentId = incidentId;
        this.evidenceType = evidenceType;
        this.sourceReferenceId = sourceReferenceId;
        this.title = title;
        this.summary = summary;
        this.confidenceScore = confidenceScore;
    }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }
    public String getEvidenceType() { return evidenceType; }
    public void setEvidenceType(String evidenceType) { this.evidenceType = evidenceType; }
    public String getSourceReferenceId() { return sourceReferenceId; }
    public void setSourceReferenceId(String sourceReferenceId) { this.sourceReferenceId = sourceReferenceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
}
