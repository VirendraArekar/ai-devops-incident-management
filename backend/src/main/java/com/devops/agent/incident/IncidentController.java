package com.devops.agent.incident;

import com.devops.agent.common.ApiResponse;
import com.devops.agent.common.PageResponse;
import com.devops.agent.security.TenantContext;
import com.devops.agent.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@Tag(name = "Incident Management", description = "Lifecycle, detection, assignment and severity tracking")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    @Operation(summary = "List all incidents with pagination and sorting")
    public ResponseEntity<ApiResponse<PageResponse<IncidentDto>>> getIncidents(
            @PageableDefault(size = 200, sort = "detectedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID orgId = TenantContext.getTenantId();
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getIncidents(orgId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed incident by ID")
    public ResponseEntity<ApiResponse<IncidentDto>> getIncident(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getIncidentById(id)));
    }

    @PostMapping
    @Operation(summary = "Create an incident manually or via external webhook")
    public ResponseEntity<ApiResponse<IncidentDto>> createIncident(
            @Valid @RequestBody CreateIncidentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID orgId = principal != null ? principal.getOrganizationId() : TenantContext.getTenantId();
        return ResponseEntity.ok(ApiResponse.ok("Incident created successfully", incidentService.createIncident(request, orgId, principal)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Advance incident lifecycle status (DETECTED -> ACKNOWLEDGED -> INVESTIGATING -> MITIGATING -> RESOLVED -> CLOSED)")
    public ResponseEntity<ApiResponse<IncidentDto>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Incident status updated", incidentService.updateStatus(id, request, principal)));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add investigation notes or comments to the incident")
    public ResponseEntity<ApiResponse<IncidentComment>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Comment added", incidentService.addComment(id, request, principal)));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get complete chronological incident audit timeline")
    public ResponseEntity<ApiResponse<List<IncidentEvent>>> getTimeline(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getTimeline(id)));
    }

    @GetMapping("/{id}/evidence")
    @Operation(summary = "Get evidence attached to incident (metrics, logs, traces, deployments)")
    public ResponseEntity<ApiResponse<List<IncidentEvidence>>> getEvidence(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getEvidence(id)));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get discussion comments for this incident")
    public ResponseEntity<ApiResponse<List<IncidentComment>>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(incidentService.getComments(id)));
    }
}
