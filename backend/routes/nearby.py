from fastapi import APIRouter, Query
import requests
from math import radians, sin, cos, sqrt, atan2

router = APIRouter()

HEADERS = {
    "User-Agent": "LifeGuardAI"
}


def distance(lat1, lon1, lat2, lon2):
    R = 6371

    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return round(R * c, 2)


@router.get("/nearby")
def nearby(place: str = Query(...)):

    # Fix common spellings
    place = place.strip().lower()

    corrections = {
        "banglore": "Bangalore",
        "benglore": "Bangalore",
        "bengaluru": "Bangalore",
        "bombay": "Mumbai",
        "madras": "Chennai",
        "calcutta": "Kolkata",
    }

    place = corrections.get(place, place.title())

    # STEP 1 : Get city coordinates
    geo_response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={
            "q": place,
            "format": "json",
            "limit": 1,
        },
        headers=HEADERS,
    )

    if geo_response.status_code != 200:
        return []

    geo = geo_response.json()

    if not geo:
        return []

    lat = geo[0]["lat"]
    lon = geo[0]["lon"]

    # STEP 2 : Search nearby hospitals
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:10000,{lat},{lon});
      way["amenity"="hospital"](around:10000,{lat},{lon});
      relation["amenity"="hospital"](around:10000,{lat},{lon});
    );
    out center tags;
    """

    overpass = requests.post(
        "https://overpass-api.de/api/interpreter",
        data=query,
        headers=HEADERS,
    )

    if overpass.status_code != 200:
        return []

    data = overpass.json()

    facilities = []

    for i, item in enumerate(data.get("elements", [])):

        tags = item.get("tags", {})

        hospital_lat = item.get("lat")

        if hospital_lat is None:
            hospital_lat = item.get("center", {}).get("lat")

        hospital_lon = item.get("lon")

        if hospital_lon is None:
            hospital_lon = item.get("center", {}).get("lon")

        facilities.append(
            {
                "id": str(i),
                "name": tags.get("name", "Hospital"),
                "address": tags.get("addr:full", place),
                "kind": "hospital",
                "distanceKm": distance(
                    lat,
                    lon,
                    hospital_lat,
                    hospital_lon,
                )
                if hospital_lat and hospital_lon
                else 0,
                "rating": 4.5,
                "phone": tags.get("phone", "Not Available"),
                "open24h": tags.get("opening_hours", "") == "24/7",
            }
        )

    facilities.sort(key=lambda x: x["distanceKm"])

    return facilities