package com.devops.agent.deployment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {
    List<Deployment> findByServiceIdOrderByDeployedAtDesc(UUID serviceId);
    List<Deployment> findAllByOrderByDeployedAtDesc();
}
