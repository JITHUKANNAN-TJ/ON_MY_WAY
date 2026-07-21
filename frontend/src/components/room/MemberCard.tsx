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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
      <div className="relative">
        <Avatar name={member.display_name} size="sm" />
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusDot status={member.status} size={6} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {member.display_name}
            {isSelf && <span className="text-text-secondary ml-1">(You)</span>}
          </span>
          {member.role === MemberRole.HOST && (
            <Badge variant="primary">Host</Badge>
          )}
          {member.role === MemberRole.VIEWER && (
            <Badge variant="default">Viewer</Badge>
          )}
        </div>
        {member.distance_km !== undefined && (
          <p className="text-xs text-text-secondary">
            {formatDistance(member.distance_km)} &middot; {formatEta(member.eta_min || 0)}
          </p>
        )}
      </div>
    </div>
  );
}
