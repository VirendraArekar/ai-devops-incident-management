package com.devops.agent.aiintegration;

import com.devops.agent.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Multi-Agent Investigation", description = "Autonomous root cause analysis, LangGraph multi-agent orchestration, and recommendations")
public class AiIntegrationController {

    private final AiServiceGateway aiServiceGateway;

    public AiIntegrationController(AiServiceGateway aiServiceGateway) {
        this.aiServiceGateway = aiServiceGateway;
    }

    @PostMapping("/analyze/{incidentId}")
    @Operation(summary = "Trigger autonomous LangGraph 8-agent investigation workflow for an incident")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyze(@PathVariable UUID incidentId) {
        return ResponseEntity.ok(ApiResponse.ok("Multi-agent investigation complete", aiServiceGateway.triggerInvestigation(incidentId)));
    }

    @GetMapping("/analysis/{incidentId}")
    @Operation(summary = "Get full Root Cause Analysis (RCA) and agent execution steps")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalysis(@PathVariable UUID incidentId) {
        return ResponseEntity.ok(ApiResponse.ok(aiServiceGateway.getAnalysis(incidentId)));
    }

    @GetMapping("/recommendations/{incidentId}")
    @Operation(summary = "Get AI-generated recovery actions and risk assessments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecommendations(@PathVariable UUID incidentId) {
        Map<String, Object> analysis = aiServiceGateway.getAnalysis(incidentId);
        List<Map<String, Object>> recs = (List<Map<String, Object>>) analysis.getOrDefault("recommended_actions", List.of());
        return ResponseEntity.ok(ApiResponse.ok(recs));
    }
}
