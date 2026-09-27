from fastapi import APIRouter, UploadFile
from app.core.exceptions import unavailable

router = APIRouter(prefix="/data", tags=["data"])


@router.post("/upload", summary="CSV/Excel upload interface (reserved; returns 501)")
def upload(file: UploadFile):
    unavailable("CSV/Excel upload")
