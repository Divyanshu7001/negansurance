from __future__ import annotations
from dataclasses import asdict
from typing import Any, Dict
from dotenv import load_dotenv

from utils.fetch_civic_alerts import _fetch_civic_alerts
from utils.fetch_aqi_summary import _fetch_aqi_summary
from utils.fetch_weather_summary import _fetch_weather_summary

load_dotenv()  # this reads .env and populates os.environ


def get_location_data(location: str, date: str, time: str) -> Dict[str, Any]:
    """Aggregate weather, AQI, and civic alerts for a location.

    Parameters
    ----------
    location: str
        Human-readable location identifier (city name, area, etc.).
    date: str
        Date for which to fetch weather summary (e.g. "2026-04-01").
    time: str
        Time for which to fetch weather summary (e.g. "18:00:00").

    Returns
    -------
    dict
        Overall JSON-ready object combining all three sources:

        {
            "location": "<name>",
            "weather": { ... },
            "aqi": { ... },
            "civic_alerts": [ ... ]
        }
    """

    weather_summary = _fetch_weather_summary(location, date, time)
    aqi_summary = _fetch_aqi_summary(location)
    civic_alerts = _fetch_civic_alerts(location, time, date)

    print(
        {
            "location": location,
            "weather": asdict(weather_summary),
            "aqi": asdict(aqi_summary),
            "civic_alerts": civic_alerts,
        }
    )

    return {
        "location": location,
        "weather": asdict(weather_summary),
        "aqi": asdict(aqi_summary),
        "civic_alerts": civic_alerts,
    }


sample_location = "Bangaluru, Karnataka"
sample_date = "2026-04-01"
sample_time = "19:00"
get_location_data(sample_location, sample_date, sample_time)

# if __name__ == "__main__":

#     # Example: one of the interval.startTime values from the API response
#
#     # get_lat_lon(sample_location)
#     # _fetch_weather_summary(sample_location, sample_time)

#     # overall = get_location_data(sample_location)
#     # print(overall)
