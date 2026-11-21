from typing import Dict, Any
from app.graph.state import InvestigationState
from app.tools.spring_boot_client import spring_client

async def run_log_agent(state: InvestigationState) -> Dict[str, Any]:
    """
    Agent 2: Log Analysis Agent
    - Analyze relevant log entries across affected services
    - Detect error patterns and recurring exceptions
    - Correlate errors with distributed trace IDs
    """
    primary_svc = state.get("primary_service", "payment-service")
    logs = await spring_client.get_logs(primary_svc, level="ERROR", limit=20)

    error_patterns = []
    trace_ids = set()
    top_exception = "None"

    for log_item in logs:
        msg = log_item.get("message", "")
        if "PSQLException" in msg or "Connection pool exhausted" in msg:
            error_patterns.append("PostgreSQL HikariPool connection pool exhaustion timeout")
            top_exception = "org.postgresql.util.PSQLException: Connection pool exhausted"
        elif "PaymentGatewayException" in msg or "HTTP 500" in msg:
            error_patterns.append("Downstream HTTP 500 received by caller")
        elif "TimeoutException" in msg:
            error_patterns.append("Socket connection timeout")

        if log_item.get("traceId"):
            trace_ids.add(log_item["traceId"])

    findings = {
        "error_patterns": list(set(error_patterns)),
        "recurring_exception": top_exception,
        "correlated_trace_ids": list(trace_ids),
        "total_analyzed_error_logs": len(logs)
    }

    step_audit = {
        "agent_name": "LogAnalysisAgent",
        "step_order": 2,
        "status": "COMPLETED",
        "duration_ms": 280,
        "findings_summary": f"Detected critical exception '{top_exception}' correlated with Trace ID {list(trace_ids)}",
        "details": findings
    }

    steps = list(state.get("agent_steps", []))
    steps.append(step_audit)

    return {
        "logs": logs,
        "log_findings": findings,
        "agent_steps": steps
    }
