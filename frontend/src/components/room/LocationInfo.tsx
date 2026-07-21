import { LocationData } from "@/types";
import { formatLatLng, formatSpeed, formatHeading, formatAccuracy, formatTimestamp } from "@/utils/formatters";

interface LocationInfoProps {
  location: LocationData | undefined;
}

export function LocationInfo({ location }: LocationInfoProps) {
  if (!location) {
    return (
      <div className="text-xs text-text-secondary">
        Waiting for GPS...
      </div>
    );
  }

  return (
    <div className="text-xs space-y-1 text-text-secondary">
      <div className="flex justify-between">
        <span>Lat</span>
        <span className="font-mono text-text">{formatLatLng(location.lat)}</span>
      </div>
      <div className="flex justify-between">
        <span>Lng</span>
        <span className="font-mono text-text">{formatLatLng(location.lng)}</span>
      </div>
      <div className="flex justify-between">
        <span>Speed</span>
        <span className="text-text">{formatSpeed(location.speed)}</span>
      </div>
      <div className="flex justify-between">
        <span>Heading</span>
        <span className="text-text">{formatHeading(location.heading)}</span>
      </div>
      <div className="flex justify-between">
        <span>Accuracy</span>
        <span className="text-text">{formatAccuracy(location.accuracy)}</span>
      </div>
      <div className="flex justify-between">
        <span>Updated</span>
        <span className="text-text">{formatTimestamp(location.timestamp)}</span>
      </div>
    </div>
  );
}
