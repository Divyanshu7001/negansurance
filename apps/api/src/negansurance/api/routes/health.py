"""Health, readiness, and instrumentation endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ...core.metrics import metrics_endpoint
from ...core.security import enforce_security_headers

router = APIRouter(tags=["health"])


@router.get("/health", include_in_schema=False)
async def health(_: None = Depends(enforce_security_headers)) -> dict[str, str]:
    return {"status": "ok"}


@router.get("/metrics", include_in_schema=False)
async def metrics(_: None = Depends(enforce_security_headers)):
    return await metrics_endpoint()
