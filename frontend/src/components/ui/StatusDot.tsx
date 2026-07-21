import { MemberStatus } from "@/types";

interface StatusDotProps {
  status: MemberStatus;
  size?: number;
  pulse?: boolean;
}

const config: Record<MemberStatus, { color: string; label: string }> = {
  [MemberStatus.ONLINE]: { color: "bg-primary", label: "Online" },
  [MemberStatus.GPS_LOST]: { color: "bg-warning", label: "GPS lost" },
  [MemberStatus.OFFLINE]: { color: "bg-white/20", label: "Offline" },
  [MemberStatus.LEFT]: { color: "bg-white/10", label: "Left" },
};

export function StatusDot({ status, size = 8, pulse }: StatusDotProps) {
  const { color } = config[status];

  return (
    <span
      className={`${color} rounded-full inline-block shrink-0 ${
        pulse && status === MemberStatus.ONLINE ? "animate-ping-slow" : ""
      }`}
      style={{ width: size, height: size }}
    />
  );
}
