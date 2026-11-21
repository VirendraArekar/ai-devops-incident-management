from typing import Dict, Any, List
from app.schemas.investigation_schemas import InvestigationOutput

class InvestigationEvaluator:
    @staticmethod
    def evaluate(output: InvestigationOutput, raw_telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate AI investigation for hallucinations, schema fidelity, and evidence traceability.
        """
        hallucination_flags: List[str] = []

        # 1. Validate trace IDs against telemetry
        allowed_traces = {t.get("traceId") for t in raw_telemetry.get("traces", [])}
        for ev in output.supporting_evidence:
            if ev.evidence_type == "TRACE":
                # Check if trace exists in actual traces or logs
                found = any(ev.title in t.get("traceId", "") or ev.summary in str(t) for t in raw_telemetry.get("traces", []))
                if not found and allowed_traces and not any(t in ev.title or t in ev.summary for t in allowed_traces):
                    hallucination_flags.append(f"Unsubstantiated trace reference: {ev.title}")

        # 2. Check root cause confidence bounds
        for rc in output.root_causes:
            if rc.confidence > 1.0 or rc.confidence < 0.0:
                hallucination_flags.append(f"Invalid confidence score: {rc.confidence}")

        # 3. Check remediation safety
        for action in output.recommended_actions:
            if action.risk_level in ["HIGH", "CRITICAL"] and not action.requires_approval:
                hallucination_flags.append(f"High risk action {action.action_type} marked as not requiring approval!")

        passed = len(hallucination_flags) == 0
        return {
            "evaluation_passed": passed,
            "hallucination_score": 0.0 if passed else len(hallucination_flags) * 0.25,
            "factual_grounding_score": 1.0 if passed else 0.75,
            "flags": hallucination_flags,
            "verdict": "APPROVED_FOR_PRESENTATION" if passed else "REJECTED_HALLUCINATED_EVIDENCE"
        }

evaluator = InvestigationEvaluator()
