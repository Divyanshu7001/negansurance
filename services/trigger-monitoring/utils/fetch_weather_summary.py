
import math
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Optional, Any, Dict, List

import os
import requests
from requests.exceptions import ReadTimeout
from dotenv import load_dotenv

from utils.fetch_location_coordinates import get_lat_lon

load_dotenv()


@dataclass
class WeatherSummary:
    did_rain: bool
    heat_wave: bool
    flood: bool


def _parse_utc(date: str, time: str) -> Optional[datetime]:
    """Return a UTC datetime from separate date and time strings.

    Expected formats (flexible but ISO-like):
    - date: "YYYY-MM-DD" (e.g. "2026-04-01")
    - time: "HH:MM" or "HH:MM:SS" (e.g. "18:00" or "18:00:00")
    """

    if not date or not time:
        return None

    try:
        # Build a combined ISO-like timestamp string.
        ts = f"{date}T{time}"
        dt = datetime.fromisoformat(ts)

        # Normalise to UTC and make tz-aware.
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt
    except Exception:
        return None


def _parse_interval_start(ts: str) -> Optional[datetime]:
    """Parse an interval.startTime ISO string (e.g. "2026-04-01T17:30:00Z") into UTC."""

    if not ts:
        return None
    try:
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        dt = datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt
    except Exception:
        return None


def _is_rainy_hour(hour: Dict[str, Any]) -> bool:
    """Heuristic to decide if a history hour is rainy using Google Weather schema."""

    weather_condition = hour.get("weatherCondition") or {}
    condition_type = (weather_condition.get("type") or "").upper()

    precipitation = hour.get("precipitation") or {}
    prob = precipitation.get("probability") or {}
    prob_type = (prob.get("type") or "").upper()
    prob_percent = prob.get("percent") or 0

    qpf = precipitation.get("qpf") or {}
    quantity = qpf.get("quantity") or 0

    return (
        "RAIN" in condition_type
        or (prob_type == "RAIN" and isinstance(prob_percent, (int, float)) and prob_percent > 0)
        or (isinstance(quantity, (int, float)) and quantity > 0)
    )


def _fetch_weather_summary(location: str, date: str, time: str) -> WeatherSummary:
    """Lookup historical hourly weather and summarise it.

    Parameters
    ----------
    location: str
        Human readable location (e.g. "Asansol, West Bengal").
    date: str
        Date for which to fetch weather summary (e.g. "2026-04-01").
    time: str
        Time for which to fetch weather summary (e.g. "17:30:00").
    Behaviour
    ---------
    - Compute how many whole hours back this time is from *now* and send that
      value in the `hours` parameter to the Google Weather history API.
    - From the returned `historyHours` array, find the entry whose
      `interval.startTime` matches `time_iso` and treat that as the anchor
      hour.
    - If that anchor hour was rainy, iterate from that hour forward in time
      (towards the present) and count for how many consecutive hours it
      remained rainy, also accumulating total rainfall depth.
    """

    api_key = os.environ["DATA_GOOGLE_API_KEY"]
    lat, lon = get_lat_lon(location)

    # 1) Compute how many hours back from now the requested time is.
    now_utc = datetime.now(timezone.utc)
    target_dt = _parse_utc(date, time)
    print(target_dt)

    if target_dt is None or target_dt > now_utc:
        # Fallback: if parsing fails or time is in the future, just use 6 hours.
        hours_back = 6
    else:
        delta_seconds = (now_utc - target_dt).total_seconds()
        hours_back = max(1, int(math.ceil(delta_seconds / 3600.0)))

    url = "https://weather.googleapis.com/v1/history/hours:lookup"

    params = {
        "key": api_key,
        "location.latitude": lat,
        "location.longitude": lon,
        "hours": 23,
    }

    try:
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
    except ReadTimeout:
        print(
            f"Timed out while fetching Weather report from Google Weather API for {location}"
        )
        return WeatherSummary(
            did_rain=False,
            heat_wave=False,
            flood=False,
        )

    data = res.json()
    history_hours: List[Dict[str, Any]] = data.get("historyHours") or []

    # historyHours is returned in reverse chronological order (most recent first).
    # Find the index whose interval.startTime matches the requested time.
    anchor_index = 0
    if target_dt is not None:
        for idx, hour in enumerate(history_hours):
            interval = hour.get("interval") or {}
            start_ts = interval.get("startTime")
            start_dt = _parse_interval_start(start_ts) if start_ts else None
            if start_dt is not None and start_dt == target_dt:
                anchor_index = idx
                break

    # Slice from the anchor hour *towards the present* (i.e. indices decreasing).
    relevant_hours: List[Dict[str, Any]] = []
    if history_hours:
        for j in range(anchor_index, -1, -1):
            relevant_hours.append(history_hours[j])

    if not relevant_hours:
        # No data, return an empty-but-valid summary
        return WeatherSummary(
            did_rain=False,
            heat_wave=False,
            flood=False,
        )

    # --- Derived booleans over the relevant time span ---

    # Did it rain at all in the relevant period?
    did_rain = any(_is_rainy_hour(h) for h in relevant_hours)

    # Was it sunny (clear with low cloud cover) in that span?
    was_sunny = any(
        (h.get("weatherCondition") or {}).get("type") == "CLEAR"
        and (h.get("cloudCover") or 100) < 20
        for h in relevant_hours
    )

    # Approximate heat wave: any temperature >= 35°C in the relevant hours.
    temps: List[float] = []
    for h in relevant_hours:
        temp = (h.get("temperature") or {}).get("degrees")
        if isinstance(temp, (int, float)):
            temps.append(float(temp))
    heat_wave_today = bool(temps and max(temps) >= 35.0)

    # Flood indicator: look for "flood" in weather description text.
    desc_text_parts: List[str] = []
    for h in relevant_hours:
        wc = h.get("weatherCondition") or {}
        desc = (wc.get("description") or {}).get("text") or ""
        if desc:
            desc_text_parts.append(desc.lower())
    flood = any("flood" in d for d in desc_text_parts)

    # --- Rain duration & intensity starting from the anchor hour ---

    rain_duration_hours = 0
    total_rain_mm = 0.0

    if history_hours:
        # Only compute if the anchor hour itself was rainy.
        if _is_rainy_hour(history_hours[anchor_index]):
            for j in range(anchor_index, -1, -1):
                h = history_hours[j]
                if not _is_rainy_hour(h):
                    break
                rain_duration_hours += 1
                precipitation = h.get("precipitation") or {}
                qpf = precipitation.get("qpf") or {}
                quantity = qpf.get("quantity") or 0
                if isinstance(quantity, (int, float)):
                    total_rain_mm += float(quantity)

    # Attach a small computed summary into the raw payload so callers can
    # inspect the detailed structure if needed.
    data.setdefault("_computedSummary", {})
    data["_computedSummary"]["hours_back"] = hours_back
    data["_computedSummary"]["anchor_start_time"] = time
    data["_computedSummary"]["rain_duration_hours_from_anchor"] = rain_duration_hours
    data["_computedSummary"]["rain_total_mm_from_anchor"] = total_rain_mm

    print(WeatherSummary(
        did_rain=did_rain,
        heat_wave=heat_wave_today,
        flood=flood))
    return WeatherSummary(
        did_rain=did_rain,
        heat_wave=heat_wave_today,
        flood=flood,
    )


sample_location = "Bangaluru, Karnataka"
sample_date = "2026-04-01"
sample_time = "18:00"
_fetch_weather_summary(sample_location, sample_date, sample_time)
