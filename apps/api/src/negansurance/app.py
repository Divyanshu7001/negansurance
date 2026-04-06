"""FastAPI application factory."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .api import build_api_router
from .core import ensure_schema, get_database, get_settings
from .core.middleware import RequestContextMiddleware


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.project_name,
        version=settings.version,
        docs_url=settings.documentation_url,
        redoc_url=settings.redoc_url,
        openapi_url=settings.openapi_url,
    )

    if settings.allowed_hosts and settings.allowed_hosts != ["*"]:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

    if settings.enable_https_redirect:
        app.add_middleware(HTTPSRedirectMiddleware)

    app.add_middleware(RequestContextMiddleware, settings=settings)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins or ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[settings.request_id_header],
    )

    database = get_database()

    @app.on_event("startup")
    async def _startup() -> None:
        await database.connect()
        await ensure_schema(database)

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        await database.disconnect()

    app.include_router(build_api_router(), prefix=settings.api_prefix)

    @app.get("/docs", include_in_schema=False)
    async def root() -> dict[str, str]:
        return {
            "service": settings.project_name,
            "version": settings.version,
            "status": "online",
        }
    

    return app
