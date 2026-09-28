from fastapi import APIRouter
from backend.demo.killer_demo import killer_demo

router = APIRouter(prefix="/demo", tags=["Killer Demo"])

@router.get("/steps")
def get_killer_demo_steps():
    """List the 8 sequential steps of the deterministic Killer Demo scenario."""
    return killer_demo.get_demo_steps()

@router.post("/step/{step_number}")
def execute_demo_step(step_number: int):
    """Execute a discrete step of the Killer Demo workflow."""
    return killer_demo.execute_step(step_number)

@router.post("/reset")
def reset_demo():
    """Reset station Bharati back to nominal baseline."""
    return killer_demo.execute_step(1)
