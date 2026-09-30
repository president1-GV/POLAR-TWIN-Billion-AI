from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
from backend.app.schemas.schemas import EnergyDispatchInputSchema, EnergyDispatchResultSchema
from backend.app.optimization.microgrid_solver import microgrid_optimizer

router = APIRouter(prefix="/optimization", tags=["MILP Optimization Engine"])


@router.post("/dispatch", response_model=Dict[str, Any])
def optimize_microgrid_dispatch(payload: EnergyDispatchInputSchema):
    """
    Executes mixed-integer linear programming (MILP) using Google OR-Tools (SCIP/CBC)
    for optimal generator unit commitment, battery BESS charge/discharge, renewable
    harvesting, and 20%+ spinning reserve guarantee.
    """
    try:
        result = microgrid_optimizer.solve_dispatch(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization solver execution notice: {str(e)}"
        )
