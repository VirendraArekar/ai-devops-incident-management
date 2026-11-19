package com.devops.agent.remediation;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "remediation_executions")
public class RemediationExecution extends BaseEntity {

    @Column(name = "approval_id")
    private UUID approvalId;

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType;

    @Column(name = "is_dry_run", nullable = false)
    private boolean isDryRun = false;

    @Column(nullable = false, length = 50)
    private String status = "RUNNING"; // RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ROLLED_BACK

    @Column(name = "executed_by")
    private UUID executedBy;

    @Column(name = "before_state", columnDefinition = "JSONB")
    private String beforeState = "{}";

    @Column(name = "after_state", columnDefinition = "JSONB")
    private String afterState = "{}";

    @Column(name = "execution_logs", columnDefinition = "TEXT")
    private String executionLogs;

    @Column(name = "recovery_verified")
    private boolean recoveryVerified = false;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public RemediationExecution() {}

    public RemediationExecution(UUID approvalId, UUID incidentId, String actionType, boolean isDryRun) {
        this.approvalId = approvalId;
        this.incidentId = incidentId;
        this.actionType = actionType;
        this.isDryRun = isDryRun;
        this.status = "RUNNING";
        this.startedAt = Instant.now();
    }

    public UUID getApprovalId() { return approvalId; }
    public void setApprovalId(UUID approvalId) { this.approvalId = approvalId; }
    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public boolean isDryRun() { return isDryRun; }
    public void setDryRun(boolean dryRun) { isDryRun = dryRun; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getExecutedBy() { return executedBy; }
    public void setExecutedBy(UUID executedBy) { this.executedBy = executedBy; }
    public String getBeforeState() { return beforeState; }
    public void setBeforeState(String beforeState) { this.beforeState = beforeState; }
    public String getAfterState() { return afterState; }
    public void setAfterState(String afterState) { this.afterState = afterState; }
    public String getExecutionLogs() { return executionLogs; }
    public void setExecutionLogs(String executionLogs) { this.executionLogs = executionLogs; }
    public boolean isRecoveryVerified() { return recoveryVerified; }
    public void setRecoveryVerified(boolean recoveryVerified) { this.recoveryVerified = recoveryVerified; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
