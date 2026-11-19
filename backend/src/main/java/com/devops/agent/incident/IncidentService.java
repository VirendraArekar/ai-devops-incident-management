package com.devops.agent.incident;

import com.devops.agent.common.PageResponse;
import com.devops.agent.common.ResourceNotFoundException;
import com.devops.agent.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository eventRepository;
    private final IncidentEvidenceRepository evidenceRepository;
    private final IncidentCommentRepository commentRepository;

    public IncidentService(
            IncidentRepository incidentRepository,
            IncidentEventRepository eventRepository,
            IncidentEvidenceRepository evidenceRepository,
            IncidentCommentRepository commentRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.eventRepository = eventRepository;
        this.evidenceRepository = evidenceRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<IncidentDto> getIncidents(UUID organizationId, Pageable pageable) {
        Page<Incident> page = incidentRepository.findAll(pageable);
        return PageResponse.from(page.map(i -> IncidentDto.from(i, "payment-service")));
    }

    @Transactional(readOnly = true)
    public IncidentDto getIncidentById(UUID id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", id));
        return IncidentDto.from(incident, "payment-service");
    }

    @Transactional
    public IncidentDto createIncident(CreateIncidentRequest request, UUID organizationId, UserPrincipal principal) {
        String incNumber = "INC-" + (Instant.now().getEpochSecond() % 100000);
        String fingerprint = "manual-" + UUID.randomUUID().toString().substring(0, 8);

        Incident incident = new Incident(
                organizationId != null ? organizationId : UUID.fromString("20000000-0000-0000-0000-000000000001"),
                incNumber,
                request.title(),
                request.severity() != null ? request.severity() : "SEV_2",
                "DETECTED",
                fingerprint
        );
        incident.setDescription(request.description());
        incident.setPrimaryServiceId(request.primaryServiceId());
        incident.setEnvironment(request.environment() != null ? request.environment() : "production");
        incident.setBusinessImpact(request.businessImpact());
        incident.setSource("MANUAL");

        incident = incidentRepository.save(incident);

        eventRepository.save(new IncidentEvent(
                incident.getId(),
                "CREATED",
                null,
                "DETECTED",
                "USER",
                principal != null ? principal.getFullName() : "SRE Engineer",
                "Incident created manually by operator"
        ));

        return IncidentDto.from(incident, "service");
    }

    @Transactional
    public IncidentDto updateStatus(UUID id, UpdateStatusRequest request, UserPrincipal principal) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", id));

        String oldStatus = incident.getStatus();
        String newStatus = request.status().toUpperCase();
        incident.setStatus(newStatus);

        Instant now = Instant.now();
        if ("ACKNOWLEDGED".equals(newStatus) && incident.getAcknowledgedAt() == null) {
            incident.setAcknowledgedAt(now);
        } else if ("MITIGATING".equals(newStatus) && incident.getMitigatedAt() == null) {
            incident.setMitigatedAt(now);
        } else if ("RESOLVED".equals(newStatus)) {
            incident.setResolvedAt(now);
        } else if ("CLOSED".equals(newStatus)) {
            incident.setClosedAt(now);
        }

        incident = incidentRepository.save(incident);

        eventRepository.save(new IncidentEvent(
                incident.getId(),
                "STATUS_CHANGE",
                oldStatus,
                newStatus,
                "USER",
                principal != null ? principal.getFullName() : "SRE Engineer",
                request.reason() != null ? request.reason() : "Status updated from " + oldStatus + " to " + newStatus
        ));

        return IncidentDto.from(incident, "payment-service");
    }

    @Transactional
    public IncidentComment addComment(UUID id, AddCommentRequest request, UserPrincipal principal) {
        if (!incidentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Incident", "id", id);
        }

        IncidentComment comment = new IncidentComment(
                id,
                principal != null ? principal.getId() : null,
                principal != null ? principal.getFullName() : "SRE Engineer",
                request.content()
        );
        comment.setInternal(request.isInternal());
        comment = commentRepository.save(comment);

        eventRepository.save(new IncidentEvent(
                id,
                "COMMENT_ADDED",
                null,
                null,
                "USER",
                principal != null ? principal.getFullName() : "SRE Engineer",
                "New incident comment posted."
        ));

        return comment;
    }

    @Transactional(readOnly = true)
    public List<IncidentEvent> getTimeline(UUID id) {
        return eventRepository.findByIncidentIdOrderByCreatedAtAsc(id);
    }

    @Transactional(readOnly = true)
    public List<IncidentEvidence> getEvidence(UUID id) {
        return evidenceRepository.findByIncidentIdOrderByCreatedAtDesc(id);
    }

    @Transactional(readOnly = true)
    public List<IncidentComment> getComments(UUID id) {
        return commentRepository.findByIncidentIdOrderByCreatedAtAsc(id);
    }
}
