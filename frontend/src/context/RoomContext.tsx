import { createContext, useContext } from "react";
import { ConnectionState, MemberData, RoomData } from "@/types";

interface RoomContextValue {
  room: RoomData | null;
  members: MemberData[];
  myId: string | null;
  isHost: boolean;
  isViewer: boolean;
  connectionState: ConnectionState;
  latency: number | null;
  gpsError: string | null;
  leaveRoom: () => void;
  reportGpsLost: () => void;
}

export const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoomContext must be used within RoomProvider");
  return ctx;
}
