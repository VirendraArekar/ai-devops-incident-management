package com.devops.agent.alert;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "alert_rules")
public class AlertRule extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(name = "condition_operator", nullable = false, length = 20)
    private String conditionOperator = "GREATER_THAN";

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 60;

    @Column(nullable = false, length = 30)
    private String severity = "SEV_2";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public AlertRule() {}

    public AlertRule(UUID organizationId, String name, String metricType, Double thresholdValue, String severity) {
        this.organizationId = organizationId;
        this.name = name;
        this.metricType = metricType;
        this.thresholdValue = thresholdValue;
        this.severity = severity;
    }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMetricType() { return metricType; }
    public void setMetricType(String metricType) { this.metricType = metricType; }
    public String getConditionOperator() { return conditionOperator; }
    public void setConditionOperator(String conditionOperator) { this.conditionOperator = conditionOperator; }
    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
