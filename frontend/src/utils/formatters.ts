export function formatLatLng(value: number): string {
  return value.toFixed(6);
}

export function formatSpeed(speed: number | null): string {
  if (speed === null || speed === undefined) return "-- km/h";
  return `${Math.round(speed)} km/h`;
}

export function formatHeading(heading: number | null): string {
  if (heading === null || heading === undefined) return "--";

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(heading / 45) % 8;
  return `${Math.round(heading)}° ${directions[index]}`;
}

export function formatAccuracy(accuracy: number | null): string {
  if (accuracy === null || accuracy === undefined) return "-- m";
  return `±${Math.round(accuracy)} m`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatEta(min: number): string {
  if (min < 1) return "1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
