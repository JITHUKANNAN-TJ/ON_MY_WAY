import { WS_VERSION } from "@/types";

const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL?.replace(/^http/, "ws") || "ws://localhost:8000";

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
  private pendingQueue: Array<{ type: string; payload: Record<string, unknown> }> = [];
  private readonly MAX_QUEUE = 100;

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
      this.flushQueue();
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
    } else {
      if (this.pendingQueue.length < this.MAX_QUEUE) {
        this.pendingQueue.push({ type, payload });
      }
    }
  }

  private flushQueue() {
    if (this.pendingQueue.length === 0) return;
    const queue = this.pendingQueue;
    this.pendingQueue = [];
    for (const msg of queue) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ version: WS_VERSION, type: msg.type, payload: msg.payload }));
      }
    }
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.retries = this.maxRetries;
    this.ws?.close();
    this.ws = null;
  }
}
