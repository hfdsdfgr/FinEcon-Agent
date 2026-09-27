from fastapi import APIRouter, Request
from app.schemas.report import ResearchReport
from app.services.report_service import get_report

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/{task_id}", response_model=ResearchReport)
def report(task_id: str, request: Request):
    return get_report(request.app.state.db, task_id)
