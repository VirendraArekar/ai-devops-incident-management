package com.devops.agent.kubernetes;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kubernetes")
@Tag(name = "Kubernetes Management", description = "Monitor clusters, namespaces, pods, deployments and health probes")
public class KubernetesController {

    private final KubernetesService kubernetesService;

    public KubernetesController(KubernetesService kubernetesService) {
        this.kubernetesService = kubernetesService;
    }

    @GetMapping("/clusters")
    @Operation(summary = "Get Kubernetes cluster health and resource capacity")
    public ResponseEntity<ApiResponse<ClusterHealth>> getClusterHealth() {
        return ResponseEntity.ok(ApiResponse.ok(kubernetesService.getClusterHealth()));
    }

    @GetMapping("/pods")
    @Operation(summary = "List pods with readiness status, CPU, memory and restart counts")
    public ResponseEntity<ApiResponse<List<PodInfo>>> getPods(
            @RequestParam(defaultValue = "production") String namespace
    ) {
        return ResponseEntity.ok(ApiResponse.ok(kubernetesService.getPods(namespace)));
    }

    @GetMapping("/deployments")
    @Operation(summary = "List deployments and replica sets")
    public ResponseEntity<ApiResponse<List<DeploymentInfo>>> getDeployments(
            @RequestParam(defaultValue = "production") String namespace
    ) {
        return ResponseEntity.ok(ApiResponse.ok(kubernetesService.getDeployments(namespace)));
    }

    @GetMapping("/events")
    @Operation(summary = "Get recent Kubernetes warning and lifecycle events")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEvents(
            @RequestParam(defaultValue = "production") String namespace
    ) {
        return ResponseEntity.ok(ApiResponse.ok(kubernetesService.getKubernetesEvents(namespace)));
    }
}
