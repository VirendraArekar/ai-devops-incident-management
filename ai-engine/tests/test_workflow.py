import pytest
import asyncio
from app.graph.workflow import investigation_graph
from app.graph.state import InvestigationState

@pytest.mark.asyncio
async def test_langgraph_full_dag_execution():
    initial_state: InvestigationState = {
        "incident_id": "test-inc-001",
        "incident_number": "INC-TEST-001",
        "title": "Payment API HTTP 500 Outage",
        "severity": "SEV_1",
        "primary_service": "payment-service",
        "description": "Simulated outage test",
        "agent_steps": []
    }

    final_state = await investigation_graph.ainvoke(initial_state)

    # Assert all 8 agents executed
    steps = final_state.get("agent_steps", [])
    assert len(steps) == 8, f"Expected 8 agent steps, got {len(steps)}"

    agent_names = [s["agent_name"] for s in steps]
    assert "IncidentInvestigationAgent" in agent_names
    assert "LogAnalysisAgent" in agent_names
    assert "MetricsAnalysisAgent" in agent_names
    assert "DistributedTracingAgent" in agent_names
    assert "DeploymentAnalysisAgent" in agent_names
    assert "RootCauseAnalysisAgent" in agent_names
    assert "RemediationPlanningAgent" in agent_names
    assert "IncidentReportingAgent" in agent_names

    # Assert root causes and confidence
    root_causes = final_state.get("root_causes", [])
    assert len(root_causes) > 0
    assert final_state.get("confidence_score", 0) >= 0.90

    # Assert remediation safety controls
    actions = final_state.get("recommended_actions", [])
    assert len(actions) > 0
    assert final_state.get("requires_approval") is True
