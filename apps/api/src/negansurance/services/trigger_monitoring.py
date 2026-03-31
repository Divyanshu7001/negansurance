"""Trigger monitoring facade."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from ..domain import TriggerEvent, TriggerType


class TriggerMonitoringService:
    def list_active(self, zone: str | None = None) -> List[TriggerEvent]:
        now = datetime.utcnow()
        sample_zone = zone or "blr-indiranagar"
        return [
            TriggerEvent(
                trigger_id="TRG-Rain-001",
                trigger_type=TriggerType.rainfall,
                zone=sample_zone,
                severity_score=0.72,
                confidence=0.81,
                started_at=now - timedelta(hours=1),
                description="Rainfall intensity above configured bound",
            ),
            TriggerEvent(
                trigger_id="TRG-AQI-002",
                trigger_type=TriggerType.pollution,
                zone=sample_zone,
                severity_score=0.66,
                confidence=0.76,
                started_at=now - timedelta(hours=3),
                ended_at=None,
                description="AQI severe band breached",
            ),
        ]
