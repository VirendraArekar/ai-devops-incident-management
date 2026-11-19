package com.devops.agent.deployment;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/deployments")
@Tag(name = "CI/CD Deployment Intelligence", description = "Track GitHub deployments, pipeline runs and incident-deployment correlations")
public class DeploymentController {

    private final DeploymentService deploymentService;

    public DeploymentController(DeploymentService deploymentService) {
        this.deploymentService = deploymentService;
    }

    @GetMapping
    @Operation(summary = "List recent deployments and commit metadata across environments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeployments() {
        return ResponseEntity.ok(ApiResponse.ok(deploymentService.getRecentDeployments()));
    }

    @GetMapping("/correlate")
    @Operation(summary = "Correlate an incident with suspect recent deployments and code changes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> correlate(
            @RequestParam(defaultValue = "payment-service") String serviceName
    ) {
        return ResponseEntity.ok(ApiResponse.ok(deploymentService.correlateIncidentWithDeployment(serviceName, Instant.now())));
    }
}
