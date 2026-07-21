import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface RoomControlsProps {
  isHost: boolean;
  roomCode: string;
  onLeave: () => void;
  onEndRoom: () => void;
  onCopyLink: () => void;
}

export function RoomControls({
  isHost,
  roomCode,
  onLeave,
  onEndRoom,
  onCopyLink,
}: RoomControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleCopy}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {copied ? "Copied!" : "Copy Invite Link"}
      </Button>

      {isHost && (
        <Button variant="danger" size="sm" className="w-full justify-start" onClick={onEndRoom}>
          End Room
        </Button>
      )}

      <Button variant="ghost" size="sm" className="w-full justify-start text-danger" onClick={onLeave}>
        Leave Room
      </Button>
    </div>
  );
}
