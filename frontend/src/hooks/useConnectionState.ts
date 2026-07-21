import { ConnectionState } from "@/types";

export function useConnectionStateLabel(state: ConnectionState): {
  label: string;
  color: string;
  dot: string;
} {
  switch (state) {
    case ConnectionState.CONNECTED:
      return { label: "Connected", color: "text-primary", dot: "bg-primary" };
    case ConnectionState.CONNECTING:
      return {
        label: "Connecting...",
        color: "text-secondary",
        dot: "bg-secondary",
      };
    case ConnectionState.RECONNECTING:
      return {
        label: "Reconnecting...",
        color: "text-warning",
        dot: "bg-warning animate-pulse",
      };
    case ConnectionState.DISCONNECTED:
      return {
        label: "Disconnected",
        color: "text-danger",
        dot: "bg-danger",
      };
    case ConnectionState.GPS_DISABLED:
      return {
        label: "GPS Disabled",
        color: "text-warning",
        dot: "bg-warning",
      };
  }
}
