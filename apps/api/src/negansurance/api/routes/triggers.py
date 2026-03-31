"""Trigger monitoring routes."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query

from ...core.security import enforce_security_headers
from ...domain import TriggerEvent
from ...services import TriggerMonitoringService
from ..deps import get_trigger_service

router = APIRouter(prefix="/triggers", tags=["triggers"])


@router.get("/active", response_model=List[TriggerEvent])
async def list_active_triggers(
    zone: str | None = Query(default=None, description="Geo zone identifier"),
    trigger_service: TriggerMonitoringService = Depends(get_trigger_service),
    _: None = Depends(enforce_security_headers),
) -> List[TriggerEvent]:
    return trigger_service.list_active(zone=zone)
