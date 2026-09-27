from pydantic import BaseModel, ConfigDict, Field, FiniteFloat, NonNegativeInt


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class DescriptiveRequest(StrictModel):
    data: dict[str, list[FiniteFloat]] = Field(min_length=1)


class OLSRequest(StrictModel):
    y: list[FiniteFloat] = Field(min_length=3)
    X: dict[str, list[FiniteFloat]] = Field(min_length=1)
    add_intercept: bool = True


class SeriesRequest(StrictModel):
    series: list[FiniteFloat] = Field(min_length=3)


class ARRequest(SeriesRequest):
    lags: int = Field(default=1, ge=1)


class ARIMARequest(SeriesRequest):
    order: tuple[NonNegativeInt, NonNegativeInt, NonNegativeInt] = (1, 0, 0)


class DiagnosticsRequest(StrictModel):
    residuals: list[FiniteFloat] = Field(min_length=3)


class DescriptiveResult(StrictModel):
    statistics: dict[str, dict[str, float | None]]
    correlation: dict[str, dict[str, float | None]]
    n_obs: int
    warnings: list[str] = Field(default_factory=list)


class OLSResult(StrictModel):
    coefficients: dict[str, float | None]
    standard_errors: dict[str, float | None]
    t_statistics: dict[str, float | None]
    p_values: dict[str, float | None]
    r_squared: float | None
    adjusted_r_squared: float | None
    aic: float | None
    bic: float | None
    log_likelihood: float | None
    n_obs: int
    residuals: list[float]
    warnings: list[str] = Field(default_factory=list)
