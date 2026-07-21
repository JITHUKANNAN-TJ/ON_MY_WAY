import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { normalizeRoomCode, stripRoomCode, parseShareLink } from "@/utils/roomCode";

export function JoinRoomPage() {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isViewer, setIsViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (value: string) => {
    const linkCode = parseShareLink(value);
    if (linkCode) {
      setInput(linkCode);
    } else {
      setInput(normalizeRoomCode(value));
    }
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
      const data = await api.joinRoom({
        room_code: formattedCode,
        display_name: displayName.trim(),
        role: isViewer ? "VIEWER" : "MEMBER",
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
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Join a Room</h1>
        <p className="text-text-secondary mb-8">
          Enter the room code or paste a share link.
        </p>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <Input
            label="Room Code or Link"
            placeholder="K8XR-MQ2P"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            maxLength={50}
          />

          <Input
            label="Your Display Name"
            placeholder="Arun"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isViewer}
              onChange={(e) => setIsViewer(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary"
            />
            <div>
              <span className="text-sm font-medium">Join as Viewer</span>
              <p className="text-xs text-text-secondary">
                Watch without sharing your location
              </p>
            </div>
          </label>

          {error && (
            <div className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </div>
    </div>
  );
}
