
from dataclasses import dataclass
from typing import Optional
import os
import requests

from utils.fetch_location_coordinates import get_lat_lon
from requests.exceptions import ReadTimeout


@dataclass
class AqiSummary:
    aqi_index: Optional[int]
    category: Optional[str]


def _fetch_aqi_summary(location: str) -> AqiSummary:
    """Fetch AQI data for a given location using Google Air Quality API.

    The `location` should be a human-readable string (e.g., "Kolkata, West Bengal").
    """

    api_key = os.environ["DATA_GOOGLE_API_KEY"]

    # Step 1: Convert location → lat/lon via Google Geocoding
    lat, lon = get_lat_lon(location)

    # Step 2: Call Google Air Quality API
    url = f"https://airquality.googleapis.com/v1/currentConditions:lookup?key={api_key}"
    body = {
        "location": {
            "latitude": lat,
            "longitude": lon,
        },
        "languageCode": "en",
    }

    try:
        res = requests.post(
            url,
            json=body,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        res.raise_for_status()
    except ReadTimeout:
        print(
            f"Timed out while fetching AQI from Google Air Quality API for {location}")
        return AqiSummary(aqi_index=None, category=None)

    data = res.json()
    indexes = data.get("indexes", [])
    if not indexes:
        return AqiSummary(aqi_index=None, category=None)

    index0 = indexes[0]
    aqi = index0.get("aqi")
    category = index0.get("category")

    print(f"Fetched AQI for {location}: {aqi} ({category})")

    return AqiSummary(aqi_index=aqi, category=category)
