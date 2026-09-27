import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from app.core.config import DB_PATH
from app.core.exceptions import FinEconError
from app.core.logging import configure_logging
from app.database.db import Database
from app.api import routes_analysis, routes_data, routes_agent, routes_report


def create_app(db_path=None):
    @asynccontextmanager
    async def lifespan(app):
        configure_logging()
        app.state.db = Database(db_path if db_path is not None else DB_PATH)
        app.state.db.initialize()
        yield

    app = FastAPI(title="FinEcon Agent", version="0.1.0", lifespan=lifespan,
                  description="Phase 0 + basic Phase 1: deterministic descriptive statistics and OLS.")

    @app.exception_handler(FinEconError)
    async def project_error(request: Request, exc: FinEconError):
        return JSONResponse(status_code=exc.status_code, content={"error": {"code": exc.code, "message": str(exc)}})

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"error": {"code": "validation_error", "message": "Invalid request parameters"}})

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"error": {"code": "http_error", "message": str(exc.detail)}})

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception):
        logging.getLogger(__name__).exception("Unhandled server error")
        return JSONResponse(status_code=500, content={"error": {"code": "internal_error", "message": "Internal server error"}})

    @app.get("/health", tags=["health"])
    def health():
        return {"status": "ok", "service": "FinEcon Agent"}

    for router in (routes_data.router, routes_analysis.router, routes_agent.router, routes_report.router):
        app.include_router(router)
    return app


app = create_app()
