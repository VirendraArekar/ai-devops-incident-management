package com.devops.agent.incident;

import com.devops.agent.alert.Alert;
import com.devops.agent.alert.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentDetectionEngineTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository eventRepository;

    @Mock
    private IncidentEvidenceRepository evidenceRepository;

    @Mock
    private AlertRepository alertRepository;

    private IncidentDetectionEngine detectionEngine;

    private final UUID orgId = UUID.randomUUID();
    private final UUID serviceId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        detectionEngine = new IncidentDetectionEngine(
                incidentRepository,
                eventRepository,
                evidenceRepository,
                alertRepository
        );
    }

    @Test
    @DisplayName("Should correlate firing alert to existing active incident without creating duplicate")
    void testAlertDeduplicationAndCorrelation() {
        String fingerprint = "fp-payment-500-surge";
        Alert alert = new Alert(
                orgId,
                serviceId,
                "HTTP 500 Spike on Payment API",
                fingerprint,
                "SEV_1",
                "http_500_rate",
                45.0,
                5.0
        );

        Incident activeIncident = new Incident(
                orgId,
                "INC-2026-999",
                "Payment Failure Active",
                "SEV_1",
                "INVESTIGATING",
                fingerprint
        );
        UUID activeIncidentId = UUID.randomUUID();
        activeIncident.setId(activeIncidentId);

        when(incidentRepository.findByFingerprintAndStatusNotIn(eq(fingerprint), anyList()))
                .thenReturn(Optional.of(activeIncident));
        when(alertRepository.save(any(Alert.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = detectionEngine.processIncomingAlert(alert);

        assertNotNull(result);
        assertEquals(activeIncidentId, result.getId());
        assertEquals("INC-2026-999", result.getIncidentNumber());

        // Verify alert was updated with existing incident ID
        verify(alertRepository).save(argThat(a -> activeIncidentId.equals(a.getIncidentId())));
        // Verify no new incident was created
        verify(incidentRepository, never()).save(any(Incident.class));
    }

    @Test
    @DisplayName("Should create new incident when no active incident matches fingerprint")
    void testCreateNewIncidentOnFreshAlert() {
        String fingerprint = "fp-new-db-leak";
        Alert alert = new Alert(
                orgId,
                serviceId,
                "Database Pool Exhaustion",
                fingerprint,
                "SEV_1",
                "hikaricp_active_connections",
                20.0,
                0.0
        );
        alert.setDescription("0 idle connections");

        when(incidentRepository.findByFingerprintAndStatusNotIn(eq(fingerprint), anyList()))
                .thenReturn(Optional.empty());
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> {
            Incident inc = i.getArgument(0);
            inc.setId(UUID.randomUUID());
            return inc;
        });

        Incident created = detectionEngine.processIncomingAlert(alert);

        assertNotNull(created);
        assertEquals("SEV_1", created.getSeverity());
        assertEquals("INVESTIGATING", created.getStatus());
        assertEquals(fingerprint, created.getFingerprint());
        assertTrue(created.getIncidentNumber().startsWith("INC-"));

        verify(incidentRepository, atLeastOnce()).save(any(Incident.class));
        verify(eventRepository, atLeastOnce()).save(any(IncidentEvent.class));
        verify(evidenceRepository).save(any(IncidentEvidence.class));
    }
}
