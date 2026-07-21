from app.schemas.location import LocationData
from app.utils.distance import haversine_km, estimate_eta_min


def calculate_eta(lat: float, lng: float, member_loc: LocationData) -> tuple[float, int]:
    distance = haversine_km(member_loc.latitude, member_loc.longitude, lat, lng)
    eta = estimate_eta_min(distance, member_loc.speed)
    return round(distance, 1), eta
