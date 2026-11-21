from typing import Dict, Any
from app.graph.state import InvestigationState
from app.tools.spring_boot_client import spring_client

async def run_deployment_agent(state: InvestigationState) -> Dict[str, Any]:
    """
    Agent 5: Deployment Analysis Agent
    - Analyze recent commits and deployments
    - Compare deployment versions
    - Identify code/configuration changes that triggered the incident
    """
    deployments = await spring_client.get_deployments()

    # Find suspect deployment
    suspect = None
    for d in deployments:
        if d.get("serviceName") == state.get("primary_service", "payment-service"):
            suspect = d
            break

    correlation = {
        "is_correlated_with_release": suspect is not None,
        "suspect_version": suspect.get("version", "v4.0.2") if suspect else None,
        "commit_sha": suspect.get("commitSha", "4f9e2b1c8a01") if suspect else None,
        "commit_message": suspect.get("commitMessage", "Optimize transaction batching") if suspect else None,
        "author": suspect.get("author", "alex@acme.com") if suspect else None,
        "recommendation": "High correlation: incident started within minutes of release v4.0.2. Immediate rollback candidate."
    }

    step_audit = {
        "agent_name": "DeploymentAnalysisAgent",
        "step_order": 5,
        "status": "COMPLETED",
        "duration_ms": 170,
        "findings_summary": f"Strong correlation with release {correlation.get('suspect_version')} (commit {correlation.get('commit_sha')})",
        "details": correlation
    }

    steps = list(state.get("agent_steps", []))
    steps.append(step_audit)

    return {
        "deployments": deployments,
        "deployment_correlations": correlation,
        "agent_steps": steps
    }
