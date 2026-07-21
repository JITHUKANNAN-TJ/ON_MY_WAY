import { RoomData } from "@/types";

interface RoomInfoProps {
  room: RoomData;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary">Room</h3>
      <p className="text-lg font-bold tracking-wide">{room.code}</p>
      <p className="text-sm text-text-secondary truncate">{room.name}</p>
      {room.meeting_point && (
        <div className="text-xs text-text-secondary">
          📍 {room.meeting_point}
        </div>
      )}
    </div>
  );
}
