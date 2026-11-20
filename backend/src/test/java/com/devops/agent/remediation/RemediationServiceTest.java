package com.devops.agent.remediation;

import com.devops.agent.common.BadRequestException;
import com.devops.agent.incident.Incident;
import com.devops.agent.incident.IncidentEvent;
import com.devops.agent.incident.IncidentEventRepository;
import com.devops.agent.incident.IncidentRepository;
import com.devops.agent.kubernetes.KubernetesService;
import com.devops.agent.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RemediationServiceTest {

    @Mock
    private RemediationActionRepository actionRepository;

    @Mock
    private RemediationApprovalRepository approvalRepository;

    @Mock
    private RemediationExecutionRepository executionRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository eventRepository;

    @Mock
    private KubernetesService kubernetesService;

    private RemediationService remediationService;

    @BeforeEach
    void setUp() {
        remediationService = new RemediationService(
                actionRepository,
                approvalRepository,
                executionRepository,
                incidentRepository,
                eventRepository,
                kubernetesService
        );
    }

    @Test
    @DisplayName("Should refuse live execution of unapproved remediation (enforce human-in-the-loop safety)")
    void testRefuseUnapprovedExecution() {
        UUID approvalId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        UUID incidentId = UUID.randomUUID();
        RemediationApproval pendingApproval = new RemediationApproval(
                orgId,
                incidentId,
                UUID.randomUUID(),
                "Rollback payment-service to v4.0.1",
                "HIGH",
                "{}"
        );
        pendingApproval.setStatus("PENDING");

        when(approvalRepository.findById(approvalId)).thenReturn(Optional.of(pendingApproval));

        UserPrincipal principal = new UserPrincipal(
                UUID.randomUUID(),
                "sre@enterprise.com",
                "password",
                "Jane Doe",
                UUID.randomUUID(),
                "SRE_ENGINEER",
                List.of(new SimpleGrantedAuthority("ROLE_SRE_ENGINEER"))
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                remediationService.executeRemediation(approvalId, false, principal)
        );

        assertTrue(ex.getMessage().contains("Cannot execute unapproved remediation"));
        verify(executionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow execution when approval status is APPROVED")
    void testAllowApprovedExecution() {
        UUID approvalId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        UUID incidentId = UUID.randomUUID();
        RemediationApproval approved = new RemediationApproval(
                orgId,
                incidentId,
                UUID.randomUUID(),
                "Rollback payment-service to v4.0.1",
                "HIGH",
                "{}"
        );
        approved.setStatus("APPROVED");

        when(approvalRepository.findById(approvalId)).thenReturn(Optional.of(approved));
        Incident incident = new Incident(orgId, "INC-2026-001", "Payment Outage", "SEV_1", "MITIGATING", "fp-payment");
        when(incidentRepository.findById(incidentId)).thenReturn(Optional.of(incident));
        when(executionRepository.save(any(RemediationExecution.class))).thenAnswer(i -> {
            RemediationExecution ex = i.getArgument(0);
            ex.setId(UUID.randomUUID());
            return ex;
        });

        UserPrincipal principal = new UserPrincipal(
                UUID.randomUUID(),
                "sre@enterprise.com",
                "password",
                "Jane Doe",
                UUID.randomUUID(),
                "SRE_ENGINEER",
                List.of(new SimpleGrantedAuthority("ROLE_SRE_ENGINEER"))
        );

        RemediationExecution execution = remediationService.executeRemediation(approvalId, false, principal);

        assertNotNull(execution);
        assertEquals("SUCCEEDED", execution.getStatus());
        assertEquals(incidentId, execution.getIncidentId());
        verify(executionRepository, atLeastOnce()).save(any(RemediationExecution.class));
        verify(eventRepository).save(any(IncidentEvent.class));
    }
}
