"""Trigger domain definitions."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TriggerType(str, Enum):
    rainfall = "rainfall"
    heat = "heat"
    pollution = "pollution"
    civic = "civic"


class TriggerEvent(BaseModel):
    trigger_id: str
    trigger_type: TriggerType
    zone: str
    severity_score: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    started_at: datetime
    ended_at: datetime | None = None
    description: str
