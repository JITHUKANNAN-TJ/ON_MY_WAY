import { useCallback, useRef, useState } from "react";
import { useGeolocation } from "./useGeolocation";
import { useWebSocket } from "./useWebSocket";
import {
  ChatMessage,
  ConnectionState,
  MemberData,
  MemberRole,
  MemberStatus,
  RoomData,
} from "@/types";

interface UseRoomOptions {
  roomCode: string;
  sessionId: string;
  displayName: string;
  role: MemberRole;
}

interface RoomState {
  room: RoomData | null;
  members: MemberData[];
  myId: string | null;
  isHost: boolean;
  isViewer: boolean;
  connectionState: ConnectionState;
  latency: number | null;
  gpsError: string | null;
  chatMessages: ChatMessage[];
}

export function useRoom({ roomCode, sessionId, displayName, role }: UseRoomOptions) {
  const [state, setState] = useState<RoomState>({
    room: null,
    members: [],
    myId: null,
    isHost: role === MemberRole.HOST,
    isViewer: role === MemberRole.VIEWER,
    connectionState: ConnectionState.DISCONNECTED,
    latency: null,
    gpsError: null,
    chatMessages: [],
  });

  const membersRef = useRef<Map<string, MemberData>>(new Map());
  const myIdRef = useRef<string | null>(null);

  const updateState = useCallback(() => {
    setState((s) => ({ ...s, members: Array.from(membersRef.current.values()) }));
  }, []);

  const handleWsMessage = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      const members = membersRef.current;

      switch (type) {
        case "welcome": {
          const myId = payload.member_id as string;
          const memberList = payload.members as MemberData[];
          const roomData = payload.room as RoomData;

          myIdRef.current = myId;
          memberList.forEach((m) => members.set(m.id, { ...m, status: m.status as MemberStatus }));
          setState((s) => ({
            ...s,
            myId,
            members: Array.from(members.values()),
            room: roomData,
          }));
          break;
        }

        case "member_joined": {
          const m = payload.member as MemberData;
          members.set(m.id, { ...m, status: m.status as MemberStatus });
          setState((s) => ({ ...s, members: Array.from(members.values()) }));
          break;
        }

        case "member_left":
        case "member_removed": {
          const leftId = payload.member_id as string;
          members.delete(leftId);
          setState((s) => ({ ...s, members: Array.from(members.values()) }));
          break;
        }

        case "member_status_change": {
          const statusId = payload.member_id as string;
          const status = payload.status as MemberStatus;
          const existing = members.get(statusId);
          if (existing) {
            members.set(statusId, { ...existing, status });
            setState((s) => ({ ...s, members: Array.from(members.values()) }));
          }
          break;
        }

        case "location_update": {
          const locId = payload.member_id as string;
          const existing2 = members.get(locId);
          if (existing2) {
            members.set(locId, {
              ...existing2,
              location: {
                lat: payload.lat as number,
                lng: payload.lng as number,
                speed: payload.speed as number | null,
                heading: payload.heading as number | null,
                accuracy: payload.accuracy as number | null,
                timestamp: payload.timestamp as number,
              },
            });
            setState((s) => ({ ...s, members: Array.from(members.values()) }));
          }
          break;
        }

        case "eta_update": {
          const etaId = payload.member_id as string;
          const existing3 = members.get(etaId);
          if (existing3) {
            members.set(etaId, {
              ...existing3,
              distance_km: payload.distance_km as number,
              eta_min: payload.eta_min as number,
            });
            setState((s) => ({ ...s, members: Array.from(members.values()) }));
          }
          break;
        }

        case "trail_update": {
          const trailId = payload.member_id as string;
          const trail = payload.trail as { lat: number; lng: number }[];
          const existing4 = members.get(trailId);
          if (existing4) {
            members.set(trailId, { ...existing4, trail });
            setState((s) => ({ ...s, members: Array.from(members.values()) }));
          }
          break;
        }

        case "room_ended": {
          setState((s) => ({ ...s, room: s.room ? { ...s.room, meeting_point: null, meeting_lat: null, meeting_lng: null } : null }));
          break;
        }

        case "chat_message": {
          const msg = payload as unknown as ChatMessage;
          setState((s) => ({
            ...s,
            chatMessages: [...s.chatMessages, msg],
          }));
          break;
        }
      }
    },
    []
  );

  const { connectionState, latency, send: sendWs } = useWebSocket({
    roomCode,
    sessionId,
    displayName,
    enabled: true,
    onMessage: handleWsMessage,
  });

  const handleGeoPosition = useCallback(
    (pos: { lat: number; lng: number; speed: number | null; heading: number | null; accuracy: number | null; timestamp: number }) => {
      if (role === MemberRole.VIEWER) return;

      sendWs("location_update", {
        lat: pos.lat,
        lng: pos.lng,
        speed: pos.speed,
        heading: pos.heading,
        accuracy: pos.accuracy,
        timestamp: pos.timestamp,
      });

      const selfId = myIdRef.current;
      if (selfId) {
        const members = membersRef.current;
        const existing = members.get(selfId);
        if (existing) {
          const newPoint = { lat: pos.lat, lng: pos.lng };
          const trail = existing.trail ? [...existing.trail, newPoint] : [newPoint];
          const MAX_TRAIL = 100;
          if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL);
          members.set(selfId, {
            ...existing,
            location: {
              lat: pos.lat,
              lng: pos.lng,
              speed: pos.speed,
              heading: pos.heading,
              accuracy: pos.accuracy,
              timestamp: pos.timestamp,
            },
            trail,
          });
          updateState();
        }
      }
    },
    [role, sendWs, updateState]
  );

  const { error: gpsError } = useGeolocation({
    enabled: role !== MemberRole.VIEWER && connectionState === ConnectionState.CONNECTED,
    onPosition: handleGeoPosition,
  });

  const leaveRoom = useCallback(() => {
    sendWs("leave_room");
  }, [sendWs]);

  const reportGpsLost = useCallback(() => {
    sendWs("gps_lost");
  }, [sendWs]);

  const sendChatMessage = useCallback(
    (text: string) => {
      sendWs("chat_message", { text });
    },
    [sendWs]
  );

  return {
    ...state,
    connectionState,
    latency,
    gpsError,
    leaveRoom,
    reportGpsLost,
    sendChatMessage,
  };
}
