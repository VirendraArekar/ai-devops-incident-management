package com.devops.agent.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    Page<Incident> findByOrganizationIdOrderByDetectedAtDesc(UUID organizationId, Pageable pageable);
    List<Incident> findByOrganizationIdAndStatusIn(UUID organizationId, List<String> statuses);
    Optional<Incident> findByFingerprintAndStatusNotIn(String fingerprint, List<String> resolvedStatuses);
    Optional<Incident> findByIncidentNumber(String incidentNumber);
    long countByOrganizationIdAndStatusIn(UUID organizationId, List<String> statuses);
}
