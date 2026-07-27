import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { normalizeRoomCode, stripRoomCode, parseShareLink } from "@/utils/roomCode";

export function JoinRoomPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isViewer, setIsViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPos = e.target.selectionStart ?? 0;
    const prevLength = input.length;
    const value = e.target.value;

    const linkCode = parseShareLink(value);
    if (linkCode) {
      setInput(linkCode);
      return;
    }

    const formatted = normalizeRoomCode(value);
    setInput(formatted);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const newLength = formatted.length;
        const diff = newLength - prevLength;
        let newPos = cursorPos + diff;
        if (diff < 0 && cursorPos > newLength) {
          newPos = newLength;
        }
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = stripRoomCode(input);
    if (code.length !== 8) {
      setError("Room code must be 8 characters");
      return;
    }
    if (!displayName.trim()) {
      setError("Enter your display name");
      return;
    }

    const formattedCode = code.slice(0, 4) + "-" + code.slice(4);

    setLoading(true);
    try {
      const existingSessionId = localStorage.getItem("omw_session_id") || undefined;
      const existingRole = localStorage.getItem("omw_role");
      const data = await api.joinRoom({
        room_code: formattedCode,
        display_name: displayName.trim(),
        role: isViewer ? "VIEWER" : "MEMBER",
        session_id: existingRole === "HOST" ? existingSessionId : undefined,
      });

      localStorage.setItem("omw_session_id", data.session_id);
      localStorage.setItem("omw_member_id", data.member_id);
      localStorage.setItem("omw_display_name", displayName.trim());
      localStorage.setItem("omw_role", isViewer ? "VIEWER" : "MEMBER");

      navigate(`/room/${data.room_code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-28 pb-16 px-4 flex items-start justify-center">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">Join a Room</h1>
          <p className="text-text-secondary">
            Enter the room code or paste a share link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <Input
            ref={inputRef}
            label="Room Code or Link"
            placeholder="K8XR-MQ2P"
            value={input}
            onChange={handleInputChange}
            maxLength={50}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            }
          />

          <Input
            label="Your Display Name"
            placeholder="Arun"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          />

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isViewer}
                onChange={(e) => setIsViewer(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-md border border-white/20 bg-white/[0.03] group-hover:border-white/30 peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
                {isViewer && (
                  <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
            <div className="select-none">
              <span className="text-sm font-medium group-hover:text-text transition-colors">Join as Viewer</span>
              <p className="text-xs text-text-secondary mt-0.5">
                Watch without sharing your location
              </p>
            </div>
          </label>

          {error && (
            <div className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3 ring-1 ring-danger/20 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </div>
    </div>
  );
}
