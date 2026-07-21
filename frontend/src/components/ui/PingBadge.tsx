interface PingBadgeProps {
  latency: number | null;
}

export function PingBadge({ latency }: PingBadgeProps) {
  if (latency === null) return null;

  const color =
    latency < 50
      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
      : latency < 150
        ? "bg-secondary/10 text-secondary ring-1 ring-secondary/20"
        : latency < 300
          ? "bg-warning/10 text-warning ring-1 ring-warning/20"
          : "bg-danger/10 text-danger ring-1 ring-danger/20";

  return (
    <span
      className={`${color} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`}
    >
      <span className="relative">
        <span className={`w-1.5 h-1.5 rounded-full bg-current block ${
          latency < 100 ? "animate-ping-slow" : ""
        }`} />
      </span>
      {latency}ms
    </span>
  );
}
