import os
import requests


def get_lat_lon(location: str) -> tuple[float, float]:
    """Geocode a human-readable location to lat/lon using Google Geocoding API."""

    api_key = os.environ["DATA_GOOGLE_API_KEY"]
    url = f"https://geocode.googleapis.com/v4/geocode/address/{location}"

    res = requests.get(
        url,
        params={"key": api_key},
        timeout=10,
    )
    res.raise_for_status()
    data = res.json()
    if not data.get("results"):
        raise ValueError("Location not found")

    loc = data["results"][0]["location"]
    # print(f"Geocoded '{location}' to lat={loc['latitude']}, lon={loc['longitude']}")
    return loc["latitude"], loc["longitude"]
