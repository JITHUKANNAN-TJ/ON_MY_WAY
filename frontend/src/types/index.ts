export const WS_VERSION = 1;

export enum MemberRole {
  HOST = "HOST",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export enum MemberStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  GPS_LOST = "GPS_LOST",
  LEFT = "LEFT",
}

export enum ConnectionState {
  CONNECTED = "CONNECTED",
  CONNECTING = "CONNECTING",
  RECONNECTING = "RECONNECTING",
  DISCONNECTED = "DISCONNECTED",
  GPS_DISABLED = "GPS_DISABLED",
}

export interface MemberData {
  id: string;
  display_name: string;
  role: MemberRole;
  status: MemberStatus;
  location?: LocationData;
  distance_km?: number;
  eta_min?: number;
  trail?: { lat: number; lng: number }[];
}

export interface LocationData {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  timestamp: number;
}

export interface RoomData {
  id: string;
  code: string;
  name: string;
  meeting_point: string | null;
  meeting_lat: number | null;
  meeting_lng: number | null;
}

export interface WsMessage {
  version: number;
  type: string;
  payload: Record<string, unknown>;
}

export interface CreateRoomResponse {
  room_id: string;
  room_code: string;
  share_link: string;
  session_id: string;
  member_id: string;
}

export interface JoinRoomResponse {
  room_id: string;
  room_code: string;
  room_name: string;
  session_id: string;
  member_id: string;
  meeting_point: string | null;
  meeting_lat: number | null;
  meeting_lng: number | null;
}

export interface RoomInfoResponse {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  meeting_point: string | null;
  meeting_lat: number | null;
  meeting_lng: number | null;
  member_count: number;
}

export interface MemberResponse {
  id: string;
  display_name: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface ChatMessage {
  member_id: string;
  display_name: string;
  text: string;
  timestamp: number;
}

export type TransportMode = "walking" | "cycling" | "bike" | "car" | "bus" | "train";

export const TRANSPORT_MODES: { key: TransportMode; icon: string; label: string }[] = [
  { key: "walking", icon: "🚶", label: "Walking" },
  { key: "cycling", icon: "🚲", label: "Cycling" },
  { key: "bike", icon: "🏍️", label: "Bike" },
  { key: "car", icon: "🚗", label: "Car" },
  { key: "bus", icon: "🚌", label: "Bus" },
  { key: "train", icon: "🚆", label: "Train" },
];

export function getOsrmProfile(mode: TransportMode): string {
  switch (mode) {
    case "walking": return "walking";
    case "cycling":
    case "bike": return "cycling";
    default: return "driving";
  }
}

export function getEtaMultiplier(mode: TransportMode): number {
  switch (mode) {
    case "bus": return 1.5;
    case "train": return -1;
    default: return 1;
  }
}
