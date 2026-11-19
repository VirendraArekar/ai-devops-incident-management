package com.devops.agent.deployment;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "deployments")
public class Deployment extends BaseEntity {

    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    @Column(name = "environment_id", nullable = false)
    private UUID environmentId;

    @Column(name = "commit_sha", nullable = false, length = 64)
    private String commitSha;

    @Column(name = "commit_message", columnDefinition = "TEXT")
    private String commitMessage;

    @Column(length = 150)
    private String author;

    @Column(length = 100)
    private String branch;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false, length = 50)
    private String status = "SUCCESS";

    @Column(name = "deployed_at", nullable = false)
    private Instant deployedAt = Instant.now();

    public Deployment() {}

    public Deployment(UUID serviceId, UUID environmentId, String commitSha, String commitMessage, String author, String branch, String version, String status) {
        this.serviceId = serviceId;
        this.environmentId = environmentId;
        this.commitSha = commitSha;
        this.commitMessage = commitMessage;
        this.author = author;
        this.branch = branch;
        this.version = version;
        this.status = status;
        this.deployedAt = Instant.now();
    }

    public UUID getServiceId() { return serviceId; }
    public void setServiceId(UUID serviceId) { this.serviceId = serviceId; }
    public UUID getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(UUID environmentId) { this.environmentId = environmentId; }
    public String getCommitSha() { return commitSha; }
    public void setCommitSha(String commitSha) { this.commitSha = commitSha; }
    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getDeployedAt() { return deployedAt; }
    public void setDeployedAt(Instant deployedAt) { this.deployedAt = deployedAt; }
}
