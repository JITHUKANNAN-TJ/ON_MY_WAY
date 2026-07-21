import { RoomData } from "@/types";

interface RoomInfoProps {
  room: RoomData;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-left">
        <div className="text-2xl font-bold tracking-[0.15em] font-mono text-primary">
          {room.code}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-text-secondary truncate max-w-[160px]">{room.name}</span>
          {room.meeting_point && (
            <span className="text-xs text-text-secondary hidden sm:inline">
              &middot; {room.meeting_point}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
