package com.devops.agent.remediation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RemediationActionRepository extends JpaRepository<RemediationAction, UUID> {
    List<RemediationAction> findByOrganizationIdAndIsEnabledTrue(UUID organizationId);
}
