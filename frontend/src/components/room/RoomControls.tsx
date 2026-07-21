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
    <div className="space-y-2 pt-2">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</p>
      <div className="space-y-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleCopy}
          leftIcon={
            copied ? (
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )
          }
        >
          {copied ? "Copied!" : "Copy Invite Link"}
        </Button>

        {isHost && (
          <Button
            variant="danger"
            size="sm"
            className="w-full justify-start"
            onClick={onEndRoom}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5V12a10 10 0 11-5.93-9.14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 3L12 13.01l-3-3" />
              </svg>
            }
          >
            End Room
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-danger"
          onClick={onLeave}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M3 12h13.5m0 0l-3-3m3 3l-3 3" />
            </svg>
          }
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
}
