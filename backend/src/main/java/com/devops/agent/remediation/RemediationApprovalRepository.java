package com.devops.agent.remediation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RemediationApprovalRepository extends JpaRepository<RemediationApproval, UUID> {
    List<RemediationApproval> findByIncidentIdOrderByCreatedAtDesc(UUID incidentId);
    List<RemediationApproval> findByStatusOrderByCreatedAtDesc(String status);
}
