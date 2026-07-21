import { MemberData, MemberRole } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { Badge } from "@/components/ui/Badge";
import { formatDistance, formatEta } from "@/utils/formatters";

interface MemberCardProps {
  member: MemberData;
  isSelf: boolean;
}

export function MemberCard({ member, isSelf }: MemberCardProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
      isSelf ? "bg-primary/[0.03] ring-1 ring-primary/10" : "hover:bg-white/[0.02]"
    }`}>
      <div className="relative">
        <Avatar name={member.display_name} size="sm" />
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={member.status} size={6} pulse />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {member.display_name}
            {isSelf && <span className="text-text-secondary text-xs ml-1 font-normal">(you)</span>}
          </span>
          {member.role === MemberRole.HOST && (
            <Badge variant="primary" size="sm">Host</Badge>
          )}
          {member.role === MemberRole.VIEWER && (
            <Badge variant="secondary" size="sm">Viewer</Badge>
          )}
        </div>
        {member.distance_km !== undefined && (
          <p className="text-xs text-text-secondary mt-0.5">
            {formatDistance(member.distance_km)}
            {member.eta_min != null && <span> &middot; {formatEta(member.eta_min)}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
