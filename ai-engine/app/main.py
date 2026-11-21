import time
from datetime import datetime
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas.investigation_schemas import (
    InvestigationInput,
    InvestigationOutput,
    RootCauseItem,
    SupportingEvidenceItem,
    RecommendedActionItem,
    AgentStepRecord,
    RagQueryRequest,
    RagChunkMatch
)
from app.graph.workflow import investigation_graph
from app.graph.state import InvestigationState
from app.rag.vector_store import knowledge_store
from app.evaluation.evaluator import evaluator

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="LangGraph Multi-Agent Root Cause Analysis & SRE Autonomous Assistant"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store of recent RCA runs
rca_cache: Dict[str, InvestigationOutput] = {}

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": settings.app_name,
        "version": settings.app_version,
        "model_provider": settings.model_provider,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/ai/models")
def get_supported_models():
    return {
        "active_provider": settings.model_provider,
        "supported_providers": [
            {"provider": "GEMINI", "models": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.8-flash"], "active": settings.model_provider == "GEMINI"},
            {"provider": "OPENAI", "models": ["gpt-4o", "gpt-4o-mini"], "active": settings.model_provider == "OPENAI"},
            {"provider": "OLLAMA", "models": ["llama3.2", "mistral-nemo", "qwen2.5-coder"], "active": settings.model_provider == "OLLAMA"}
        ]
    }

@app.post("/api/v1/ai/investigate", response_model=InvestigationOutput)
async def investigate_incident(input_data: InvestigationInput):
    """
    Executes the LangGraph Multi-Agent Investigation DAG across all 8 specialized agents.
    """
    start_time = time.time()

    initial_state: InvestigationState = {
        "incident_id": input_data.incident_id,
        "incident_number": input_data.incident_number,
        "title": input_data.title,
        "severity": input_data.severity,
        "primary_service": input_data.primary_service,
        "description": input_data.description,
        "agent_steps": []
    }

    try:
        # Run LangGraph pipeline
        final_state: InvestigationState = await investigation_graph.ainvoke(initial_state)

        # Assemble validated InvestigationOutput schema
        output = InvestigationOutput(
            incident_id=final_state.get("incident_id", input_data.incident_id),
            incident_number=final_state.get("incident_number", input_data.incident_number),
            summary=final_state.get("executive_summary", "Multi-agent root cause analysis complete."),
            severity=final_state.get("severity", input_data.severity),
            affected_services=final_state.get("affected_services", [input_data.primary_service]),
            root_causes=[RootCauseItem(**rc) for rc in final_state.get("root_causes", [])],
            confidence_score=final_state.get("confidence_score", 0.95),
            supporting_evidence=[SupportingEvidenceItem(**ev) for ev in final_state.get("supporting_evidence", [])],
            related_logs=final_state.get("logs", []),
            related_metrics=final_state.get("metrics", []),
            related_traces=final_state.get("traces", []),
            deployment_correlations=final_state.get("deployment_correlations", {}),
            business_impact=final_state.get("business_impact", "Service degradation detected."),
            recommended_actions=[RecommendedActionItem(**act) for act in final_state.get("recommended_actions", [])],
            risk_level=final_state.get("risk_level", "HIGH"),
            requires_approval=final_state.get("requires_approval", True),
            agent_steps=[AgentStepRecord(**s) for s in final_state.get("agent_steps", [])],
            investigation_timestamp=datetime.utcnow()
        )

        # Cache for immediate RCA viewing
        rca_cache[input_data.incident_id] = output
        rca_cache[input_data.incident_number] = output

        return output

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Investigation failed: {str(e)}")

@app.get("/api/v1/ai/rca/{incident_id}", response_model=InvestigationOutput)
async def get_incident_rca(incident_id: str):
    if incident_id in rca_cache:
        return rca_cache[incident_id]

    # If not in cache, trigger investigation on demand
    default_input = InvestigationInput(
        incident_id=incident_id,
        incident_number=f"INC-{incident_id[:8]}",
        title="Payment API HTTP 500 & Connection Pool Exhaustion",
        severity="SEV_1",
        primary_service="payment-service",
        description="Automated incident investigation"
    )
    return await investigate_incident(default_input)

@app.post("/api/v1/ai/rag/search", response_model=List[RagChunkMatch])
async def search_knowledge_base(request: RagQueryRequest):
    return knowledge_store.search(
        query=request.query,
        service_name=request.service_name,
        limit=request.limit
    )

@app.post("/api/v1/ai/evaluate")
async def evaluate_investigation(output: InvestigationOutput):
    telemetry = {
        "logs": output.related_logs,
        "metrics": output.related_metrics,
        "traces": output.related_traces
    }
    return evaluator.evaluate(output, telemetry)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
