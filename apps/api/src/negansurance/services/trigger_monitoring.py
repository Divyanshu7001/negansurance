"""Trigger monitoring facade backed by the shared data collectors."""

from __future__ import annotations

import logging
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List

from ..domain import TriggerEvent, TriggerType


def _resolve_repo_root() -> Path:
    current = Path(__file__).resolve()
    for candidate in current.parents:
        if (candidate / ".git").exists() or (candidate / "pyproject.toml").exists():
            return candidate
    return current.parents[-1]


REPO_ROOT = _resolve_repo_root()
if str(REPO_ROOT) not in sys.path:
    sys.path.append(str(REPO_ROOT))

try:
    from services.trigger_monitoring import get_location_data
except ModuleNotFoundError as exc:  # pragma: no cover - hard failure
    raise RuntimeError("services.trigger_monitoring package is missing") from exc


logger = logging.getLogger(__name__)


class TriggerMonitoringService:
    """Translate raw trigger data into domain events."""

    def __init__(
        self,
        *,
        default_zone: str = "blr-indiranagar",
        default_location: str = "Bengaluru, Karnataka",
    ) -> None:
        self._default_zone = default_zone
        self._default_location = default_location

    def list_active(self, zone: str | None = None) -> List[TriggerEvent]:
        observed_at = datetime.now(timezone.utc)
        zone_label = zone or self._default_zone
        location_query = zone or self._default_location
        date_str = observed_at.date().isoformat()
        time_str = observed_at.strftime("%H:%M")

        try:
            payload = get_location_data(location_query, date_str, time_str)
        except Exception:  # pragma: no cover - defensive network catch
            logger.exception("Failed to pull trigger signals for zone %s", location_query)
            return self._fallback(zone_label, observed_at)

        events = self._build_events(payload, zone_label, observed_at)
        if not events:
            return self._fallback(zone_label, observed_at)
        return events

    def _build_events(
        self,
        payload: Dict[str, Any],
        zone: str,
        observed_at: datetime,
    ) -> List[TriggerEvent]:
        events: List[TriggerEvent] = []

        weather = payload.get("weather") or {}
        if weather.get("did_rain"):
            events.append(
                self._event(
                    trigger_type=TriggerType.rainfall,
                    zone=zone,
                    observed_at=observed_at,
                    severity=self._score_from_flags(primary=True),
                    confidence=0.82,
                    description="Localized rainfall detected in the last observation window",
                )
            )
        if weather.get("flood"):
            events.append(
                self._event(
                    trigger_type=TriggerType.rainfall,
                    zone=zone,
                    observed_at=observed_at - timedelta(hours=1),
                    severity=self._score_from_flags(primary=True, elevated=True),
                    confidence=0.78,
                    description="Urban flood risk flagged by meteorological feed",
                )
            )
        if weather.get("heat_wave"):
            events.append(
                self._event(
                    trigger_type=TriggerType.heat,
                    zone=zone,
                    observed_at=observed_at,
                    severity=self._score_from_flags(primary=True),
                    confidence=0.8,
                    description="Heat wave heuristics breached for the current day",
                )
            )

        aqi = payload.get("aqi") or {}
        aqi_index = aqi.get("aqi_index")
        aqi_category = (aqi.get("category") or "").strip()
        if self._aqi_actionable(aqi_index, aqi_category):
            severity = self._normalize(aqi_index or 0, lower_bound=75, upper_bound=400)
            confidence = 0.88 if aqi_index else 0.6
            description = f"AQI {aqi_index or 'N/A'} ({aqi_category or 'unknown'})"
            events.append(
                self._event(
                    trigger_type=TriggerType.pollution,
                    zone=zone,
                    observed_at=observed_at - timedelta(hours=2),
                    severity=severity,
                    confidence=confidence,
                    description=description,
                )
            )

        civic_alerts = payload.get("civic_alerts") or {}
        events.extend(self._civic_events(civic_alerts, zone, observed_at))
        return events

    def _civic_events(
        self,
        civic_alerts: Dict[str, Any],
        zone: str,
        observed_at: datetime,
    ) -> List[TriggerEvent]:
        labels = {
            "protests": (0.68, 0.6, "Civic unrest/protests reported within 2km"),
            "curfews": (0.72, 0.62, "Movement restrictions or curfew announced"),
            "traffic_jam": (0.55, 0.58, "Extended traffic congestion detected during patrol window"),
        }

        events: List[TriggerEvent] = []
        for key, (severity, confidence, description) in labels.items():
            if not civic_alerts.get(key):
                continue
            events.append(
                self._event(
                    trigger_type=TriggerType.civic,
                    zone=zone,
                    observed_at=observed_at - timedelta(minutes=30),
                    severity=severity,
                    confidence=confidence,
                    description=description,
                    suffix=key.upper(),
                )
            )
        return events

    def _event(
        self,
        *,
        trigger_type: TriggerType,
        zone: str,
        observed_at: datetime,
        severity: float,
        confidence: float,
        description: str,
        suffix: str | None = None,
    ) -> TriggerEvent:
        base_suffix = suffix or trigger_type.value.upper()
        trigger_id = f"TRG-{base_suffix}-{observed_at:%Y%m%d%H%M}"
        return TriggerEvent(
            trigger_id=trigger_id,
            trigger_type=trigger_type,
            zone=zone,
            severity_score=round(min(max(severity, 0.0), 1.0), 2),
            confidence=round(min(max(confidence, 0.0), 1.0), 2),
            started_at=observed_at,
            description=description,
        )

    @staticmethod
    def _score_from_flags(*, primary: bool, elevated: bool | None = None) -> float:
        base = 0.65 if primary else 0.45
        if elevated:
            base += 0.15
        return min(base, 0.95)

    @staticmethod
    def _normalize(value: float, *, lower_bound: float, upper_bound: float) -> float:
        if upper_bound <= lower_bound:
            return 0.5
        clamped = max(lower_bound, min(value, upper_bound)) - lower_bound
        return round(clamped / (upper_bound - lower_bound), 2)

    @staticmethod
    def _aqi_actionable(aqi_index: Any, category: str) -> bool:
        if isinstance(aqi_index, (int, float)) and aqi_index >= 100:
            return True
        normalized = (category or "").lower()
        return any(level in normalized for level in ["poor", "very poor", "severe", "hazard"])

    def _fallback(self, zone: str, observed_at: datetime) -> List[TriggerEvent]:
        reference = observed_at - timedelta(hours=1)
        return [
            TriggerEvent(
                trigger_id=f"TRG-RAIN-SEED-{reference:%H%M}",
                trigger_type=TriggerType.rainfall,
                zone=zone,
                severity_score=0.58,
                confidence=0.55,
                started_at=reference,
                description="Fallback rainfall trigger (external feeds unavailable)",
            ),
            TriggerEvent(
                trigger_id=f"TRG-AQI-SEED-{reference:%H%M}",
                trigger_type=TriggerType.pollution,
                zone=zone,
                severity_score=0.53,
                confidence=0.5,
                started_at=reference - timedelta(hours=2),
                description="Fallback AQI trigger (external feeds unavailable)",
            ),
        ]
