package com.devops.agent.incident;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "incident_comments")
public class IncidentComment extends BaseEntity {

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "author_id")
    private UUID authorId;

    @Column(name = "author_name", nullable = false, length = 150)
    private String authorName;

    @Column(name = "is_internal", nullable = false)
    private boolean isInternal = true;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    public IncidentComment() {}

    public IncidentComment(UUID incidentId, UUID authorId, String authorName, String content) {
        this.incidentId = incidentId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.content = content;
    }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }
    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public boolean isInternal() { return isInternal; }
    public void setInternal(boolean internal) { isInternal = internal; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
