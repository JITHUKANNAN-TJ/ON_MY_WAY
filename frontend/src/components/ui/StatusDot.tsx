import { MemberStatus } from "@/types";

interface StatusDotProps {
  status: MemberStatus;
  size?: number;
}

const colors: Record<MemberStatus, string> = {
  [MemberStatus.ONLINE]: "bg-primary",
  [MemberStatus.GPS_LOST]: "bg-warning",
  [MemberStatus.OFFLINE]: "bg-white/20",
  [MemberStatus.LEFT]: "bg-white/10",
};

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <span
      className={`${colors[status]} rounded-full inline-block shrink-0`}
      style={{ width: size, height: size }}
    />
  );
}
