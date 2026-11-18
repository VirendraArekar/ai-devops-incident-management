package com.devops.agent.incident;

import com.devops.agent.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "incident_events")
public class IncidentEvent extends BaseEntity {

    @Column(name = "incident_id", nullable = false)
    private UUID incidentId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "previous_state", length = 100)
    private String previousState;

    @Column(name = "new_state", length = 100)
    private String newState;

    @Column(name = "actor_type", nullable = false, length = 50)
    private String actorType = "SYSTEM";

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_name", length = 150)
    private String actorName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    public IncidentEvent() {}

    public IncidentEvent(UUID incidentId, String eventType, String previousState, String newState, String actorType, String actorName, String description) {
        this.incidentId = incidentId;
        this.eventType = eventType;
        this.previousState = previousState;
        this.newState = newState;
        this.actorType = actorType;
        this.actorName = actorName;
        this.description = description;
    }

    public UUID getIncidentId() { return incidentId; }
    public void setIncidentId(UUID incidentId) { this.incidentId = incidentId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }
    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }
    public String getActorType() { return actorType; }
    public void setActorType(String actorType) { this.actorType = actorType; }
    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
