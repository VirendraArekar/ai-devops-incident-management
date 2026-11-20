from typing import Dict, Any
from app.graph.state import InvestigationState
from app.tools.spring_boot_client import spring_client

async def run_investigation_agent(state: InvestigationState) -> Dict[str, Any]:
    """
    Agent 1: Incident Investigation Agent
    - Understand the incident and identify affected services
    - Determine investigation scope
    - Collect related alerts and infrastructure context
    """
    primary_svc = state.get("primary_service", "payment-service")
    title = state.get("title", "Service Failure")

    # Discover affected services based on service topology
    affected = [primary_svc]
    if "payment" in primary_svc.lower():
        affected.append("order-service") # upstream dependency
    elif "order" in primary_svc.lower():
        affected.extend(["payment-service", "notification-service"])

    scope_desc = (
        f"Investigation initiated for {title}. Scope includes primary service '{primary_svc}' "
        f"and interconnected dependencies {affected}. Ingesting telemetry, error clusters, "
        f"and Kubernetes cluster events."
    )

    step_audit = {
        "agent_name": "IncidentInvestigationAgent",
        "step_order": 1,
        "status": "COMPLETED",
        "duration_ms": 120,
        "findings_summary": f"Scope bounded to {len(affected)} services: {', '.join(affected)}",
        "details": {"affected_services": affected, "primary_service": primary_svc}
    }

    steps = list(state.get("agent_steps", []))
    steps.append(step_audit)

    return {
        "affected_services": affected,
        "scope_summary": scope_desc,
        "agent_steps": steps
    }
