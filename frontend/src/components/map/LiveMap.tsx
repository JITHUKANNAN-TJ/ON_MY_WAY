import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MemberData, MemberRole, RoomData } from "@/types";
import { formatDistance, formatEta, formatRelativeTime } from "@/utils/formatters";

type TileStyle = "street" | "dark" | "satellite";

const TILE_STYLES: Record<TileStyle, { url: string; attribution: string }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
};

const TILE_KEY = "omw_tile_style";

function getStoredTileStyle(): TileStyle {
  const stored = localStorage.getItem(TILE_KEY);
  if (stored === "street" || stored === "dark" || stored === "satellite") return stored;
  return "street";
}

function createMemberIcon(color: string, isSelf: boolean): L.DivIcon {
  const size = isSelf ? 20 : 16;
  const border = isSelf ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)";
  const hitArea = 16;
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
    iconSize: [size + hitArea, size + hitArea],
    iconAnchor: [(size + hitArea) / 2, (size + hitArea) / 2],
  });
}

const MEMBER_COLORS = [
  "#10B981", "#38BDF8", "#F59E0B", "#8B5CF6",
  "#EC4899", "#F97316", "#06B6D4", "#84CC16",
];

function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

function createMeetingPointIcon(): L.DivIcon {
  return L.divIcon({
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
  });
}

interface LiveMapProps {
  members: MemberData[];
  myId: string | null;
  room: RoomData | null;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

function MapController({ members, myId }: { members: MemberData[]; myId: string | null }) {
  const map = useMap();
  const prevBounds = useRef<string | null>(null);

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
      const key = bounds.toBBoxString();
      if (key !== prevBounds.current) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
        prevBounds.current = key;
      }
    }
  }, [members, myId, map]);

  return null;
}

function TileLayerSwitcher({ style, onChange }: { style: TileStyle; onChange: (s: TileStyle) => void }) {
  const styles: { key: TileStyle; label: string }[] = [
    { key: "street", label: "Street" },
    { key: "dark", label: "Dark" },
    { key: "satellite", label: "Satellite" },
  ];

  return (
    <>
      {/* Desktop: row of buttons */}
      <div className="absolute top-4 right-4 z-[1000] gap-1 hidden sm:flex">
        {styles.map((s) => (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg backdrop-blur-xl transition-all duration-200 ${
              style === s.key
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "glass-strong text-text-secondary hover:text-text hover:bg-white/[0.08]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Mobile: dropdown select */}
      <div className="absolute top-4 right-4 z-[1000] sm:hidden">
        <select
          value={style}
          onChange={(e) => onChange(e.target.value as TileStyle)}
          className="glass-strong text-xs font-medium rounded-lg px-2.5 py-1.5 text-text-secondary backdrop-blur-xl border-0 outline-none appearance-none cursor-pointer"
          aria-label="Map style"
        >
          {styles.map((s) => (
            <option key={s.key} value={s.key} className="bg-surface text-text">
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export function LiveMap({ members, myId, room, onToggleFullscreen, isFullscreen }: LiveMapProps) {
  const myMember = members.find((m) => m.id === myId);
  const center: [number, number] = myMember?.location
    ? [myMember.location.lat, myMember.location.lng]
    : [20, 0];

  const [tileStyle, setTileStyle] = useState<TileStyle>(getStoredTileStyle);

  const handleTileStyleChange = useCallback((style: TileStyle) => {
    setTileStyle(style);
    localStorage.setItem(TILE_KEY, style);
  }, []);

  const tileLayer = TILE_STYLES[tileStyle];

  const viewerIds = useMemo(
    () => new Set(members.filter((m) => m.role === MemberRole.VIEWER).map((m) => m.id)),
    [members]
  );

  const memberColorMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m, idx) => map.set(m.id, getMemberColor(idx)));
    return map;
  }, [members]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />

        <MapController members={members} myId={myId} />

        {/* Trails */}
        {members
          .filter((m) => m.trail && m.trail.length > 1 && !viewerIds.has(m.id))
          .map((m) => {
            const color = memberColorMap.get(m.id) || "#10B981";
            const trailPositions = m.trail!.map((p) => [p.lat, p.lng] as [number, number]);
            return (
              <Polyline
                key={`trail-${m.id}`}
                positions={trailPositions}
                pathOptions={{
                  color,
                  weight: 3,
                  opacity: 0.5,
                  dashArray: "6 4",
                }}
              />
            );
          })}

        {/* Route lines to meeting point */}
        {room?.meeting_lat != null && room?.meeting_lng != null && (
          members
            .filter((m) => m.location && !viewerIds.has(m.id))
            .map((m) => {
              const color = memberColorMap.get(m.id) || "#10B981";
              return (
                <Polyline
                  key={`route-${m.id}`}
                  positions={[
                    [m.location!.lat, m.location!.lng],
                    [room.meeting_lat!, room.meeting_lng!],
                  ]}
                  pathOptions={{
                    color,
                    weight: 2,
                    opacity: 0.25,
                    dashArray: "8 8",
                  }}
                />
              );
            })
        )}

        {/* Meeting Point */}
        {room?.meeting_lat != null && room?.meeting_lng != null && (
          <Marker
            position={[room.meeting_lat, room.meeting_lng]}
            icon={createMeetingPointIcon()}
          >
            <Popup>
              <div className="text-sm font-medium">
                {room.meeting_point || "Meeting Point"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Member markers */}
        {members
          .filter((m) => m.location && !viewerIds.has(m.id))
          .map((m) => {
            const loc = m.location!;
            const color = memberColorMap.get(m.id) || "#10B981";
            const isSelf = m.id === myId;

            return (
              <div key={m.id}>
                <Marker
                  position={[loc.lat, loc.lng]}
                  icon={createMemberIcon(color, isSelf)}
                >
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[140px]">
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
                      <div className="text-xs text-text-secondary">
                        Updated: {formatRelativeTime(loc.timestamp)}
                      </div>
                      {m.trail && m.trail.length > 1 && (
                        <div className="text-xs text-text-secondary">
                          Trail: {m.trail.length} points
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

      {/* Tile layer switcher */}
      <TileLayerSwitcher style={tileStyle} onChange={handleTileStyleChange} />

      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 left-4 z-[1000] p-2 rounded-lg glass-strong text-text-secondary hover:text-text hover:bg-white/[0.08] transition-all duration-200"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
