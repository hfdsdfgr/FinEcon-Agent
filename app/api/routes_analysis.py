from fastapi import APIRouter
from app.schemas.analysis import (DescriptiveRequest, DescriptiveResult, OLSRequest, OLSResult,
                                 SeriesRequest, ARRequest, ARIMARequest, DiagnosticsRequest)
from app.services.analysis_service import analyze

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/descriptive", response_model=DescriptiveResult)
def descriptive(request: DescriptiveRequest):
    return analyze("descriptive_statistics", request)


@router.post("/ols", response_model=OLSResult)
def ols(request: OLSRequest):
    return analyze("ols", request)


@router.post("/adf", summary="ADF interface (reserved; returns 501)")
def adf(request: SeriesRequest):
    return analyze("adf_test", request)


@router.post("/ar", summary="AR interface (reserved; returns 501)")
def ar(request: ARRequest):
    return analyze("ar", request)


@router.post("/arima", summary="ARIMA interface (reserved; returns 501)")
def arima(request: ARIMARequest):
    return analyze("arima", request)


@router.post("/diagnostics", summary="Diagnostics interface (reserved; returns 501)")
def diagnostics(request: DiagnosticsRequest):
    return analyze("diagnostics", request)
