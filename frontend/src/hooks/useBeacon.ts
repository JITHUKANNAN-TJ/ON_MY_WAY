import { useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface BeaconPosition {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  timestamp: number;
}

export function useBeacon(roomCode: string | undefined, sessionId: string) {
  const lastPos = useRef<BeaconPosition | null>(null);

  const setLastPosition = (pos: BeaconPosition) => {
    lastPos.current = pos;
  };

  useEffect(() => {
    if (!roomCode || !sessionId) return;

    const sendBeacon = () => {
      const pos = lastPos.current;
      if (!pos) return;
      const data = {
        lat: pos.lat,
        lng: pos.lng,
        speed: pos.speed,
        heading: pos.heading,
        accuracy: pos.accuracy,
        timestamp: pos.timestamp,
        session_id: sessionId,
      };
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      navigator.sendBeacon(`${API_URL}/api/rooms/${roomCode}/location`, blob);
    };

    window.addEventListener("pagehide", sendBeacon);
    window.addEventListener("beforeunload", sendBeacon);
    document.addEventListener("freeze", sendBeacon);

    return () => {
      window.removeEventListener("pagehide", sendBeacon);
      window.removeEventListener("beforeunload", sendBeacon);
      document.removeEventListener("freeze", sendBeacon);
    };
  }, [roomCode, sessionId]);

  return { setLastPosition };
}
