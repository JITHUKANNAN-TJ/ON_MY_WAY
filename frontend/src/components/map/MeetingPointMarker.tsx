import { useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

interface MeetingPointMarkerProps {
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

export function MeetingPointMarker({ onSelect, initialLat, initialLng }: MeetingPointMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : null
  );

  useMapEvents({
    click(e) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(pos);
      onSelect(pos[0], pos[1]);
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={L.divIcon({
        html: `<div style="
          width:32px;height:32px;
          background:#EF4444;
          border:3px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 20px #EF444480;
        "><div style="
          width:8px;height:8px;
          background:#fff;
          border-radius:50%;
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
        "></div></div>`,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      })}
    >
      <Popup>Meeting Point</Popup>
    </Marker>
  );
}
