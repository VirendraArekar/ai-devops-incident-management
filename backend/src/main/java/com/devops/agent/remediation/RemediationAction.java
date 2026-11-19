package com.devops.agent.remediation;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "remediation_actions")
public class RemediationAction extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType; // RESTART_POD, SCALE_DEPLOYMENT, ROLLBACK_DEPLOYMENT, FLUSH_CONNECTIONS

    @Column(name = "target_environment", nullable = false, length = 50)
    private String targetEnvironment = "production";

    @Column(name = "target_service_id")
    private UUID targetServiceId;

    @Column(name = "command_template", nullable = false)
    private String commandTemplate;

    @Column(name = "parameters_schema", columnDefinition = "JSONB")
    private String parametersSchema = "{}";

    @Column(name = "risk_level", nullable = false, length = 30)
    private String riskLevel = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "requires_approval", nullable = false)
    private boolean requiresApproval = true;

    @Column(name = "is_enabled", nullable = false)
    private boolean isEnabled = true;

    public RemediationAction() {}

    public RemediationAction(UUID organizationId, String name, String actionType, String commandTemplate, String riskLevel, boolean requiresApproval) {
        this.organizationId = organizationId;
        this.name = name;
        this.actionType = actionType;
        this.commandTemplate = commandTemplate;
        this.riskLevel = riskLevel;
        this.requiresApproval = requiresApproval;
        this.isEnabled = true;
    }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getTargetEnvironment() { return targetEnvironment; }
    public void setTargetEnvironment(String targetEnvironment) { this.targetEnvironment = targetEnvironment; }
    public UUID getTargetServiceId() { return targetServiceId; }
    public void setTargetServiceId(UUID targetServiceId) { this.targetServiceId = targetServiceId; }
    public String getCommandTemplate() { return commandTemplate; }
    public void setCommandTemplate(String commandTemplate) { this.commandTemplate = commandTemplate; }
    public String getParametersSchema() { return parametersSchema; }
    public void setParametersSchema(String parametersSchema) { this.parametersSchema = parametersSchema; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public boolean isRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(boolean requiresApproval) { this.requiresApproval = requiresApproval; }
    public boolean isEnabled() { return isEnabled; }
    public void setEnabled(boolean enabled) { isEnabled = enabled; }
}
