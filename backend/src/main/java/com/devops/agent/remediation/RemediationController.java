package com.devops.agent.remediation;

import com.devops.agent.common.ApiResponse;
import com.devops.agent.security.TenantContext;
import com.devops.agent.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/remediation")
@Tag(name = "Automated Remediation Engine", description = "Execute predefined recovery actions with dry-run and human approval workflow")
public class RemediationController {

    private final RemediationService remediationService;

    public RemediationController(RemediationService remediationService) {
        this.remediationService = remediationService;
    }

    @GetMapping("/actions")
    @Operation(summary = "List supported and authorized remediation action templates")
    public ResponseEntity<ApiResponse<List<RemediationAction>>> getActions() {
        return ResponseEntity.ok(ApiResponse.ok(remediationService.getActions(TenantContext.getTenantId())));
    }

    @GetMapping("/approvals")
    @Operation(summary = "List pending or historical remediation approvals")
    public ResponseEntity<ApiResponse<List<RemediationApproval>>> getApprovals(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(remediationService.getApprovals(status)));
    }

    @GetMapping("/executions")
    @Operation(summary = "List audit log of executed remediation workflows")
    public ResponseEntity<ApiResponse<List<RemediationExecution>>> getExecutions(
            @RequestParam(required = false) UUID incidentId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(remediationService.getExecutions(incidentId)));
    }

    @PostMapping("/{id}/dry-run")
    @Operation(summary = "Simulate remediation action in dry-run mode without modifying production")
    public ResponseEntity<ApiResponse<RemediationExecution>> dryRun(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Dry run executed successfully", remediationService.executeRemediation(id, true, principal)));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Human authorization for high-risk recovery action")
    public ResponseEntity<ApiResponse<RemediationApproval>> approve(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String notes = body != null ? body.get("notes") : "Approved by authorized SRE";
        return ResponseEntity.ok(ApiResponse.ok("Remediation authorized", remediationService.approveAction(id, notes, principal)));
    }

    @PostMapping("/{id}/execute")
    @Operation(summary = "Execute approved remediation action and verify recovery")
    public ResponseEntity<ApiResponse<RemediationExecution>> execute(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Remediation executed", remediationService.executeRemediation(id, false, principal)));
    }
}
