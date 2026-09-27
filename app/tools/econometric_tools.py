from pydantic import ValidationError
from app.core.exceptions import FinEconError
from app.schemas.analysis import DescriptiveRequest, OLSRequest, SeriesRequest, ARRequest, ARIMARequest, DiagnosticsRequest
from app.schemas.agent import ToolResult
from app.econometrics.descriptive import descriptive_statistics
from app.econometrics.regression import run_ols
from app.econometrics.stationarity import run_adf
from app.econometrics.timeseries import run_ar, run_arima
from app.econometrics.diagnostics import run_diagnostics
from app.tools.data_tools import DATA_TOOLS

TOOLS = {
    **DATA_TOOLS,
    "descriptive_statistics": (DescriptiveRequest, descriptive_statistics),
    "ols": (OLSRequest, run_ols),
    "adf_test": (SeriesRequest, run_adf),
    "ar": (ARRequest, run_ar),
    "arima": (ARIMARequest, run_arima),
    "diagnostics": (DiagnosticsRequest, run_diagnostics),
}


def execute_tool(name, parameters):
    """Run only allowlisted callables with Pydantic-validated parameters."""
    if name not in TOOLS:
        raise FinEconError("Unknown tool", "unknown_tool")
    schema, function = TOOLS[name]
    try:
        args = schema.model_validate(parameters)
    except ValidationError as exc:
        raise FinEconError("Invalid tool parameters", "validation_error") from exc
    try:
        return function(**args.model_dump())
    except FinEconError:
        raise
    except Exception as exc:
        raise FinEconError("Tool execution failed", "tool_error", 500) from exc


def invoke_tool(name, parameters):
    try:
        result = execute_tool(name, parameters)
        return ToolResult(tool=name, status="completed", result=result.model_dump(mode="json"))
    except FinEconError as exc:
        return ToolResult(tool=name, status="failed", error={"code": exc.code, "message": str(exc)})
