import { ConnectionState } from "@/types";
import { useConnectionStateLabel } from "@/hooks/useConnectionState";

interface ConnectionBannerProps {
  state: ConnectionState;
  latency: number | null;
}

export function ConnectionBanner({ state, latency }: ConnectionBannerProps) {
  const info = useConnectionStateLabel(state);

  if (state === ConnectionState.CONNECTED && latency !== null && latency < 100) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium animate-scale-in ${
        state === ConnectionState.CONNECTED
          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
          : state === ConnectionState.RECONNECTING
            ? "bg-warning/10 text-warning ring-1 ring-warning/20"
            : state === ConnectionState.CONNECTING
              ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
              : "bg-danger/10 text-danger ring-1 ring-danger/20"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${info.dot} ${
        state === ConnectionState.CONNECTED ? "animate-ping-slow" : ""
      }`} />
      {info.label}
      {latency !== null && state === ConnectionState.CONNECTED && (
        <span className="opacity-60">({latency}ms)</span>
      )}
    </div>
  );
}
