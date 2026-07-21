import { MemberData } from "@/types";
import { MemberCard } from "./MemberCard";

interface MemberListProps {
  members: MemberData[];
  myId: string | null;
}

export function MemberList({ members, myId }: MemberListProps) {
  return (
    <div className="space-y-0.5">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} isSelf={m.id === myId} />
      ))}
    </div>
  );
}
