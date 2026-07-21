import { useCallback, useEffect, useRef, useState } from "react";
import { WsClient } from "@/services/websocket";
import { ConnectionState } from "@/types";

interface UseWebSocketOptions {
  roomCode: string;
  sessionId: string;
  displayName: string;
  enabled: boolean;
  onMessage: (type: string, payload: Record<string, unknown>) => void;
}

export function useWebSocket({
  roomCode,
  sessionId,
  displayName,
  enabled,
  onMessage,
}: UseWebSocketOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  );
  const [latency, setLatency] = useState<number | null>(null);
  const clientRef = useRef<WsClient | null>(null);
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMessage = useCallback(
    (data: { type: string; payload: Record<string, unknown> }) => {
      if (data.type === "pong") {
        const clientTs = data.payload.client_ts as number;
        if (clientTs) {
          setLatency(Date.now() - clientTs);
        }
        return;
      }
      onMessage(data.type, data.payload);
    },
    [onMessage]
  );

  useEffect(() => {
    if (!enabled || !roomCode || !sessionId) return;

    setConnectionState(ConnectionState.CONNECTING);

    const client = new WsClient(roomCode, sessionId, displayName, {
      onMessage: handleMessage,
      onOpen: () => setConnectionState(ConnectionState.CONNECTED),
      onClose: () => {
        setConnectionState((prev) =>
          prev === ConnectionState.CONNECTED
            ? ConnectionState.RECONNECTING
            : ConnectionState.DISCONNECTED
        );
      },
      onError: () => setConnectionState(ConnectionState.DISCONNECTED),
    });

    client.connect();
    clientRef.current = client;

    pingInterval.current = setInterval(() => {
      client.send("ping", { client_ts: Date.now() });
    }, 10000);

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      client.close();
      clientRef.current = null;
      setConnectionState(ConnectionState.DISCONNECTED);
    };
  }, [enabled, roomCode, sessionId, displayName, handleMessage]);

  const send = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      clientRef.current?.send(type, payload);
    },
    []
  );

  return { connectionState, latency, send };
}
