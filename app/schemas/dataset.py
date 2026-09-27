from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    rows: int
    columns: list[str]
    date_column: str | None = None
    numeric_columns: list[str]
    missing_values: dict[str, int]
    transformations: list[dict[str, str]] = Field(default_factory=list)
