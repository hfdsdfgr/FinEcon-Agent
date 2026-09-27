from typing import Any
from pydantic import BaseModel, Field


class ResearchReport(BaseModel):
    research_question: str
    dataset_summary: dict[str, Any]
    methodology: list[str]
    models: list[dict[str, Any]]
    diagnostics: dict[str, Any] = Field(default_factory=dict)
    interpretation: str
    limitations: list[str]
    warnings: list[str]
