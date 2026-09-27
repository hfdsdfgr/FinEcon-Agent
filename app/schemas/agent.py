from typing import Any, Literal
from pydantic import Field
from app.schemas.analysis import StrictModel, FiniteFloat


class ResearchRequest(StrictModel):
    research_question: str = Field(min_length=1)
    data: dict[str, list[FiniteFloat]] = Field(min_length=1)
    dependent_variable: str = Field(min_length=1)
    independent_variables: list[str] = Field(min_length=1)


class ResearchProblem(StrictModel):
    research_goal: str = "relationship_analysis"
    research_question: str
    dependent_variable: str
    independent_variables: list[str]
    candidate_methods: list[str] = Field(default_factory=lambda: ["OLS"])


class PlanStep(StrictModel):
    step: int
    tool: str
    parameters: dict[str, Any]


class ToolResult(StrictModel):
    tool: str
    status: Literal["completed", "failed"]
    result: dict[str, Any] | None = None
    error: dict[str, str] | None = None


class TaskState(StrictModel):
    task_id: str
    status: Literal["created", "planning", "running", "completed", "failed"] = "created"
    current_step: int = 0
    steps: list[ToolResult] = Field(default_factory=list)
    dataset: dict[str, Any] = Field(default_factory=dict)
    results: dict[str, Any] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
