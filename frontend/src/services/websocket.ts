import { WS_VERSION } from "@/types";

const WS_URL = import.meta.env.VITE_WS_URL || "";

export type WsMessageHandler = (data: { type: string; payload: Record<string, unknown> }) => void;

export class WsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: WsMessageHandler;
  private onOpen?: () => void;
  private onClose?: () => void;
  private onError?: (err: Event) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxRetries = 10;
  private retries = 0;

  constructor(
    roomCode: string,
    sessionId: string,
    displayName: string,
    handlers: {
      onMessage: WsMessageHandler;
      onOpen?: () => void;
      onClose?: () => void;
      onError?: (err: Event) => void;
    }
  ) {
    this.url = `${WS_URL}/ws/${roomCode}?session_id=${sessionId}&display_name=${encodeURIComponent(displayName)}`;
    this.onMessage = handlers.onMessage;
    this.onOpen = handlers.onOpen;
    this.onClose = handlers.onClose;
    this.onError = handlers.onError;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.retries = 0;
      this.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.version === WS_VERSION || !data.version) {
          this.onMessage(data);
        }
      } catch {
        // ignore malformed
      }
    };

    this.ws.onclose = () => {
      this.onClose?.();
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      this.onError?.(err);
    };
  }

  private scheduleReconnect() {
    if (this.retries >= this.maxRetries) return;
    const delay = Math.min(1000 * 2 ** this.retries, 10000);
    this.retries++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ version: WS_VERSION, type, payload }));
    }
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.retries = this.maxRetries;
    this.ws?.close();
    this.ws = null;
  }
}
