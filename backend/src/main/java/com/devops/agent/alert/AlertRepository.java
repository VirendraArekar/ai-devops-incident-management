package com.devops.agent.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByOrganizationIdOrderByStartsAtDesc(UUID organizationId);
    List<Alert> findByStatusOrderByStartsAtDesc(String status);
    Optional<Alert> findByFingerprintAndStatus(String fingerprint, String status);
}
