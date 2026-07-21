const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function estimateEtaMin(distanceKm: number, speedKph: number | null): number {
  const speed = speedKph && speedKph > 1 ? speedKph : 5;
  return Math.max(1, Math.round((distanceKm / speed) * 60));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
