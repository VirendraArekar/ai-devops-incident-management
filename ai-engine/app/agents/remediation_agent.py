from typing import Dict, Any, List
from app.graph.state import InvestigationState

async def run_remediation_agent(state: InvestigationState) -> Dict[str, Any]:
    """
    Agent 7: Remediation Planning Agent
    - Generate structured recovery recommendations
    - Classify operational risk
    - Identify required permissions and enforce human approval
    - Determine dry-run feasibility
    """
    primary_svc = state.get("primary_service", "payment-service")
    deployment_corr = state.get("deployment_correlations", {})

    actions: List[Dict[str, Any]] = []

    # 1. Primary Recommendation: Rollback if correlated with recent release
    if deployment_corr.get("is_correlated_with_release", True):
        actions.append({
            "action_type": "ROLLBACK_DEPLOYMENT",
            "target_resource": f"{primary_svc}-deployment",
            "parameters": {
                "namespace": "production",
                "deployment": primary_svc,
                "targetRevision": 1,
                "targetVersion": "v4.0.1"
            },
            "risk_level": "HIGH",
            "requires_approval": True,
            "dry_run_supported": True,
            "justification": f"Roll back {primary_svc} to stable revision v4.0.1 to revert commit 4f9e2b1 which caused database pool starvation."
        })

    # 2. Secondary Immediate Relief: Pod Rolling Restart
    actions.append({
        "action_type": "RESTART_POD",
        "target_resource": f"{primary_svc}-pods",
        "parameters": {
            "namespace": "production",
            "deployment": primary_svc
        },
        "risk_level": "LOW",
        "requires_approval": True,
        "dry_run_supported": True,
        "justification": f"Rolling restart {primary_svc} deployment pods to instantly release leaked connection handles."
    })

    # 3. Tertiary Scale Up for traffic overload
    actions.append({
        "action_type": "SCALE_DEPLOYMENT",
        "target_resource": f"{primary_svc}-deployment",
        "parameters": {
            "namespace": "production",
            "deployment": primary_svc,
            "replicas": 4
        },
        "risk_level": "MEDIUM",
        "requires_approval": True,
        "dry_run_supported": True,
        "justification": "Scale out pods from 2 to 4 to distribute connection load."
    })

    step_audit = {
        "agent_name": "RemediationPlanningAgent",
        "step_order": 7,
        "status": "COMPLETED",
        "duration_ms": 160,
        "findings_summary": f"Generated {len(actions)} safe remediation plans. High-risk rollback requires human sign-off.",
        "details": {"recommended_actions": actions, "requires_approval": True}
    }

    steps = list(state.get("agent_steps", []))
    steps.append(step_audit)

    return {
        "recommended_actions": actions,
        "risk_level": "HIGH",
        "requires_approval": True,
        "agent_steps": steps
    }
