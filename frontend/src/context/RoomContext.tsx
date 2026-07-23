import { createContext, useContext, ReactNode } from "react";
import { useRoom } from "@/hooks/useRoom";
import { ConnectionState, MemberData, RoomData, MemberRole } from "@/types";

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

const RoomContext = createContext<RoomContextValue | null>(null);

interface RoomProviderProps {
  children: ReactNode;
  roomCode: string;
  sessionId: string;
  displayName: string;
  role: MemberRole;
}

export function RoomProvider({
  children,
  roomCode,
  sessionId,
  displayName,
  role,
}: RoomProviderProps) {
  const roomState = useRoom({ roomCode, sessionId, displayName, role });

  return (
    <RoomContext.Provider value={roomState}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoomContext must be used within RoomProvider");
  return ctx;
}