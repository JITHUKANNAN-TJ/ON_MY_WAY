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
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
        state === ConnectionState.CONNECTED
          ? "bg-primary/10 text-primary"
          : state === ConnectionState.RECONNECTING
            ? "bg-warning/10 text-warning"
            : "bg-danger/10 text-danger"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${info.dot}`} />
      {info.label}
      {latency !== null && state === ConnectionState.CONNECTED && (
        <span className="opacity-70">{latency}ms</span>
      )}
    </div>
  );
}
