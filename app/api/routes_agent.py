from fastapi import APIRouter, Request
from app.schemas.agent import ResearchRequest, TaskState
from app.services.agent_service import run_research

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/research", response_model=TaskState)
def research(body: ResearchRequest, request: Request):
    return run_research(body, request.app.state.db)


@router.get("/task/{task_id}", response_model=TaskState)
def task(task_id: str, request: Request):
    return request.app.state.db.get(task_id)[0]
