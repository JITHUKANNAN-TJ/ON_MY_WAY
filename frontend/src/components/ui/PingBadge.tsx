interface PingBadgeProps {
  latency: number | null;
}

export function PingBadge({ latency }: PingBadgeProps) {
  if (latency === null) return null;

  const color =
    latency < 50
      ? "bg-primary/10 text-primary"
      : latency < 150
        ? "bg-secondary/10 text-secondary"
        : latency < 300
          ? "bg-warning/10 text-warning"
          : "bg-danger/10 text-danger";

  return (
    <span
      className={`${color} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {latency}ms
    </span>
  );
}
