import { LocationData } from "@/types";
import { formatLatLng, formatSpeed, formatHeading, formatAccuracy, formatTimestamp } from "@/utils/formatters";

interface LocationInfoProps {
  location: LocationData | undefined;
}

export function LocationInfo({ location }: LocationInfoProps) {
  if (!location) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-secondary py-1">
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Waiting for GPS...
      </div>
    );
  }

  const rows = [
    { label: "Latitude", value: formatLatLng(location.lat) },
    { label: "Longitude", value: formatLatLng(location.lng) },
    { label: "Speed", value: formatSpeed(location.speed) },
    { label: "Heading", value: formatHeading(location.heading) },
    { label: "Accuracy", value: formatAccuracy(location.accuracy) },
    { label: "Updated", value: formatTimestamp(location.timestamp) },
  ];

  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between items-center py-0.5">
          <span className="text-xs text-text-secondary">{r.label}</span>
          <span className="text-xs font-mono text-text truncate ml-4">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
