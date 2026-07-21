import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MemberData, MemberRole, MemberStatus, RoomData } from "@/types";
import { formatDistance, formatEta } from "@/utils/formatters";

function createMemberIcon(color: string, isSelf: boolean): L.DivIcon {
  const size = isSelf ? 20 : 16;
  const border = isSelf ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)";
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:${border};
      border-radius:50%;
      box-shadow:0 0 12px ${color}80,0 2px 8px rgba(0,0,0,0.4);
      transition:all 0.3s ease;
    "></div>`,
    className: "",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

const MEMBER_COLORS = [
  "#10B981", "#38BDF8", "#F59E0B", "#8B5CF6",
  "#EC4899", "#F97316", "#06B6D4", "#84CC16",
];

function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

interface LiveMapProps {
  members: MemberData[];
  myId: string | null;
  room: RoomData | null;
}

function MapController({ members, myId }: { members: MemberData[]; myId: string | null }) {
  const map = useMap();
  const prevBounds = useRef<L.LatLngBoundsExpression | null>(null);

  useEffect(() => {
    const withLoc = members.filter(
      (m) => m.location && m.id !== myId
    );
    const mine = members.find((m) => m.id === myId);
    const points: L.LatLngExpression[] = [];

    if (mine?.location) points.push([mine.location.lat, mine.location.lng]);
    withLoc.forEach((m) => {
      if (m.location) points.push([m.location.lat, m.location.lng]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (!prevBounds.current || !bounds.equals(prevBounds.current)) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
        prevBounds.current = bounds;
      }
    }
  }, [members, myId, map]);

  return null;
}

export function LiveMap({ members, myId, room }: LiveMapProps) {
  const myMember = members.find((m) => m.id === myId);
  const center: [number, number] = myMember?.location
    ? [myMember.location.lat, myMember.location.lng]
    : [20, 0];

  const viewerIds = new Set(
    members.filter((m) => m.role === MemberRole.VIEWER).map((m) => m.id)
  );

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController members={members} myId={myId} />

      {/* Meeting Point */}
      {room?.meeting_lat != null && room?.meeting_lng != null && (
        <>
          <Marker
            position={[room.meeting_lat, room.meeting_lng]}
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
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          >
            <Popup>
              <div className="text-sm font-medium">
                {room.meeting_point || "Meeting Point"}
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Member markers */}
      {members
        .filter((m) => m.location && !viewerIds.has(m.id))
        .map((m, idx) => {
          const loc = m.location!;
          const color = getMemberColor(idx);
          const isSelf = m.id === myId;

          return (
            <div key={m.id}>
              <Marker
                position={[loc.lat, loc.lng]}
                icon={createMemberIcon(color, isSelf)}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[120px]">
                    <div className="font-semibold">
                      {m.display_name}
                      {isSelf && " (You)"}
                    </div>
                    {m.distance_km !== undefined && (
                      <div className="text-text-secondary">
                        {formatDistance(m.distance_km)} &middot; {formatEta(m.eta_min || 0)}
                      </div>
                    )}
                    {loc.speed != null && (
                      <div className="text-xs text-text-secondary">
                        Speed: {Math.round(loc.speed)} km/h
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
              {loc.accuracy != null && loc.accuracy > 0 && (
                <Circle
                  center={[loc.lat, loc.lng]}
                  radius={loc.accuracy}
                  pathOptions={{
                    color,
                    opacity: 0.15,
                    fillOpacity: 0.08,
                  }}
                />
              )}
            </div>
          );
        })}
    </MapContainer>
  );
}
