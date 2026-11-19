package com.devops.agent.incident;

import com.devops.agent.alert.Alert;
import com.devops.agent.alert.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class IncidentDetectionEngine {

    private static final Logger log = LoggerFactory.getLogger(IncidentDetectionEngine.class);

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository eventRepository;
    private final IncidentEvidenceRepository evidenceRepository;
    private final AlertRepository alertRepository;

    public IncidentDetectionEngine(
            IncidentRepository incidentRepository,
            IncidentEventRepository eventRepository,
            IncidentEvidenceRepository evidenceRepository,
            AlertRepository alertRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.eventRepository = eventRepository;
        this.evidenceRepository = evidenceRepository;
        this.alertRepository = alertRepository;
    }

    @Transactional
    public Incident processIncomingAlert(Alert alert) {
        log.info("Processing incoming alert: {} (Fingerprint: {})", alert.getTitle(), alert.getFingerprint());

        // Check for existing active incident with matching fingerprint (deduplication)
        List<String> resolvedStatuses = List.of("RESOLVED", "CLOSED");
        Optional<Incident> existingIncident = incidentRepository.findByFingerprintAndStatusNotIn(alert.getFingerprint(), resolvedStatuses);

        if (existingIncident.isPresent()) {
            Incident inc = existingIncident.get();
            log.info("Correlating alert {} to active incident {}", alert.getTitle(), inc.getIncidentNumber());

            alert.setIncidentId(inc.getId());
            alertRepository.save(alert);

            evidenceRepository.save(new IncidentEvidence(
                    inc.getId(),
                    "METRIC",
                    alert.getFingerprint(),
                    "Correlated Firing Alert: " + alert.getTitle(),
                    alert.getDescription() != null ? alert.getDescription() : "Metric threshold breach: " + alert.getCurrentValue(),
                    0.95
            ));

            eventRepository.save(new IncidentEvent(
                    inc.getId(),
                    "ALERT_CORRELATED",
                    inc.getStatus(),
                    inc.getStatus(),
                    "SYSTEM",
                    "AlertCorrelator",
                    "Correlated recurring alert " + alert.getTitle() + " into existing incident."
            ));

            return inc;
        }

        // Create new Incident automatically
        String incNumber = "INC-" + Instant.now().getEpochSecond() % 100000;
        String title = "Automatic Incident: " + alert.getTitle();

        Incident incident = new Incident(
                alert.getOrganizationId(),
                incNumber,
                title,
                alert.getSeverity(),
                "DETECTED",
                alert.getFingerprint()
        );
        incident.setPrimaryServiceId(alert.getServiceId());
        incident.setDescription(alert.getDescription() != null ? alert.getDescription() : "Generated automatically from firing alert: " + alert.getTitle());
        incident.setAffectedServices("[\"" + (alert.getMetricName() != null ? alert.getMetricName() : "service") + "\"]");
        incident = incidentRepository.save(incident);

        alert.setIncidentId(incident.getId());
        alertRepository.save(alert);

        // Record initial timeline event
        eventRepository.save(new IncidentEvent(
                incident.getId(),
                "STATUS_CHANGE",
                null,
                "DETECTED",
                "SYSTEM",
                "IncidentDetectionEngine",
                "Incident automatically detected from firing alert " + alert.getTitle()
        ));

        // Attach initial evidence
        evidenceRepository.save(new IncidentEvidence(
                incident.getId(),
                "METRIC",
                alert.getFingerprint(),
                "Initial Alert Trigger: " + alert.getTitle(),
                "Metric " + alert.getMetricName() + " breached threshold " + alert.getThresholdValue() + " with value " + alert.getCurrentValue(),
                0.99
        ));

        // Advance to INVESTIGATING
        incident.setStatus("INVESTIGATING");
        incidentRepository.save(incident);

        eventRepository.save(new IncidentEvent(
                incident.getId(),
                "STATUS_CHANGE",
                "DETECTED",
                "INVESTIGATING",
                "AI_AGENT",
                "LangGraph SRE Supervisor",
                "Autonomous root cause investigation triggered across logs, metrics, traces, and deployments."
        ));

        return incident;
    }
}
