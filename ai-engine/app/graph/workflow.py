from langgraph.graph import StateGraph, START, END
from app.graph.state import InvestigationState
from app.agents.investigation_agent import run_investigation_agent
from app.agents.log_agent import run_log_agent
from app.agents.metrics_agent import run_metrics_agent
from app.agents.trace_agent import run_trace_agent
from app.agents.deployment_agent import run_deployment_agent
from app.agents.rca_agent import run_rca_agent
from app.agents.remediation_agent import run_remediation_agent
from app.agents.reporting_agent import run_reporting_agent

def create_investigation_workflow():
    builder = StateGraph(InvestigationState)

    # 1. Register all 8 specialized agent nodes
    builder.add_node("investigation", run_investigation_agent)
    builder.add_node("log_analysis", run_log_agent)
    builder.add_node("metrics_analysis", run_metrics_agent)
    builder.add_node("trace_analysis", run_trace_agent)
    builder.add_node("deployment_analysis", run_deployment_agent)
    builder.add_node("root_cause_analysis", run_rca_agent)
    builder.add_node("remediation_planning", run_remediation_agent)
    builder.add_node("incident_reporting", run_reporting_agent)

    # 2. Build DAG edges
    builder.add_edge(START, "investigation")
    builder.add_edge("investigation", "log_analysis")
    builder.add_edge("log_analysis", "metrics_analysis")
    builder.add_edge("metrics_analysis", "trace_analysis")
    builder.add_edge("trace_analysis", "deployment_analysis")
    builder.add_edge("deployment_analysis", "root_cause_analysis")
    builder.add_edge("root_cause_analysis", "remediation_planning")
    builder.add_edge("remediation_planning", "incident_reporting")
    builder.add_edge("incident_reporting", END)

    return builder.compile()

investigation_graph = create_investigation_workflow()
