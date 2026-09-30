"""
POLAR-TWIN SMART AUTOMATION REST API
Exposes verified closed-loop smart automation endpoints to the Mission Control Command Center.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header, Request, status
from pydantic import BaseModel, Field

from backend.app.automation.engine import automation_engine
from backend.app.automation.audit import audit_ledger
from backend.app.automation.policies import can_user_execute, DEFAULT_STATION_POLICIES


router = APIRouter(prefix="/automation", tags=["Smart Automation"])


class AutomationEvaluateRequest(BaseModel):
    station_id: str = Field(default="station_bharati")
    input_state: Optional[Dict[str, Any]] = None
    trigger_type: str = Field(default="THRESHOLD_TRIGGER")
    trigger_description: str = Field(default="Manual or periodic evaluation cycle")
    idempotency_key: Optional[str] = None


class ActionApprovalRequest(BaseModel):
    action_id: str
    operator_username: str = Field(default="operator.duty")
    operator_role: str = Field(default="STATION_OPERATOR")
    parameter_override: Optional[Dict[str, Any]] = None


class ActionRejectRequest(BaseModel):
    action_id: str
    operator_username: str = Field(default="operator.duty")
    operator_role: str = Field(default="STATION_OPERATOR")
    reason: str = Field(default="Operational conflict or priority divergence")


class ScenarioTriggerRequest(BaseModel):
    scenario_key: str = Field(..., description="One of: 'high_demand_surge', 'generator_failure', 'blizzard_fuel_cascade'")
    station_id: str = Field(default="station_bharati")
    operator_role: str = Field(default="STATION_OPERATOR")


@router.post("/evaluate", summary="Execute Closed-Loop Automation Evaluation")
def evaluate_automation_pipeline(req: AutomationEvaluateRequest):
    """
    Executes the complete Observe -> Validate -> Predict -> Decide -> Recommend pipeline.
    """
    try:
        result = automation_engine.evaluate_automation(
            station_id=req.station_id,
            input_state=req.input_state,
            trigger_type=req.trigger_type,
            trigger_desc=req.trigger_description,
            idempotency_key=req.idempotency_key,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Automation evaluation failed: {str(e)}"
        )


@router.post("/approve", summary="Human-in-the-Loop Operator Action Approval")
def approve_automation_action(req: ActionApprovalRequest):
    """
    Authorized operator approves a recommended action.
    Transitions: ACTION_PENDING -> SIMULATING -> VERIFYING -> COMPLETED -> AUDITED.
    Enforces server-side authorization.
    """
    if not can_user_execute(req.operator_role, "approve_consequential_actions"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role '{req.operator_role}' is not authorized to approve consequential operational actions."
        )

    try:
        result = automation_engine.approve_action(
            action_id=req.action_id,
            operator_username=req.operator_username,
            operator_role=req.operator_role,
            parameter_override=req.parameter_override
        )
        return result
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except (KeyError, ValueError) as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/reject", summary="Operator Rejects Action Recommendation")
def reject_automation_action(req: ActionRejectRequest):
    """
    Operator rejects recommendation with operational reason.
    """
    if not can_user_execute(req.operator_role, "reject_action"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role '{req.operator_role}' is not authorized to reject actions."
        )

    try:
        result = automation_engine.reject_action(
            action_id=req.action_id,
            operator_username=req.operator_username,
            operator_role=req.operator_role,
            reason=req.reason
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/scenario", summary="Trigger Deterministic Evaluator Demonstration Scenario")
def trigger_scenario(req: ScenarioTriggerRequest):
    """
    Executes one of three deterministic evaluator demonstration scenarios:
    - 'high_demand_surge'
    - 'generator_failure'
    - 'blizzard_fuel_cascade'
    """
    try:
        result = automation_engine.run_deterministic_scenario(
            scenario_key=req.scenario_key,
            station_id=req.station_id,
            user_role=req.operator_role
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/status", summary="Smart Automation System Status")
def get_automation_status(station_id: Optional[str] = "station_bharati"):
    """
    Returns active automations, pending recommendations, system policies, and engine health.
    """
    active_recs = automation_engine.get_active_recommendations()
    recent_audits = audit_ledger.get_recent_audits(limit=5, station_id=station_id)
    policies = DEFAULT_STATION_POLICIES.get(station_id or "station_bharati", {})

    return {
        "engine_state": "OBSERVING" if not active_recs else "ACTION_REQUIRED",
        "station_id": station_id,
        "active_recommendations_count": len(active_recs),
        "active_recommendations": active_recs,
        "recent_audits": recent_audits,
        "station_policies": policies,
        "supported_scenarios": [
            {
                "key": "high_demand_surge",
                "label": "High Energy Demand Surge (1,050 kW)",
                "domain": "Energy & Microgrid",
                "description": "Demand surge triggers ML forecast, peak-shaving BESS discharge recommendation, and reserve protection."
            },
            {
                "key": "generator_failure",
                "label": "Primary Generator Trip (What-If Contingency)",
                "domain": "Emergency Operations",
                "description": "Sudden loss of BH-GEN-01 triggers critical load priority, emergency standby dispatch, and life-support protection."
            },
            {
                "key": "blizzard_fuel_cascade",
                "label": "Katabatic Blizzard & Fuel Runway Risk",
                "domain": "Cross-Domain (Weather → Energy → Logistics)",
                "description": "42 m/s winds spike thermal building loss, increasing daily fuel burn and triggering supply chain alert."
            }
        ]
    }


@router.get("/trace/{execution_id}", summary="Get Step-by-Step Decision Trace")
def get_trace(execution_id: str):
    """
    Returns the complete step-by-step decision trace for an execution ID.
    """
    trace = automation_engine.get_execution_trace(execution_id)
    if not trace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Execution trace '{execution_id}' not found.")
    return trace


@router.get("/history", summary="Cryptographic Automation Audit Trail")
def get_audit_history(limit: int = 50, station_id: Optional[str] = None):
    """
    Returns tamper-evident audit ledger entries with cryptographic SHA-256 hashes and latency metrics.
    """
    return {
        "total_records": len(audit_ledger._records),
        "audits": audit_ledger.get_recent_audits(limit=limit, station_id=station_id)
    }
