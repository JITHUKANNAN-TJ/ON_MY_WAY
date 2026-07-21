import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/services/api";
import { MapContainer, TileLayer } from "react-leaflet";
import { MeetingPointMarker } from "@/components/map/MeetingPointMarker";

export function CreateRoomPage() {
  const navigate = useNavigate();

  const [hostName, setHostName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [meetingPointName, setMeetingPointName] = useState("");
  const [meetingLat, setMeetingLat] = useState<number | null>(null);
  const [meetingLng, setMeetingLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    room_code: string;
    share_link: string;
    session_id: string;
    member_id: string;
  } | null>(null);

  const handleMeetingSelect = useCallback((lat: number, lng: number) => {
    setMeetingLat(lat);
    setMeetingLng(lng);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hostName.trim()) {
      setError("Enter your name");
      return;
    }
    if (!roomName.trim()) {
      setError("Enter a room name");
      return;
    }

    setLoading(true);
    try {
      const data = await api.createRoom({
        host_name: hostName.trim(),
        room_name: roomName.trim(),
        meeting_point: meetingPointName.trim() || undefined,
        meeting_lat: meetingLat ?? undefined,
        meeting_lng: meetingLng ?? undefined,
      });

      localStorage.setItem("omw_session_id", data.session_id);
      localStorage.setItem("omw_member_id", data.member_id);
      localStorage.setItem("omw_display_name", hostName.trim());
      localStorage.setItem("omw_role", "HOST");

      setResult({
        room_code: data.room_code,
        share_link: `${window.location.origin}/room/${data.room_code}`,
        session_id: data.session_id,
        member_id: data.member_id,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.share_link);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.share_link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enterRoom = () => {
    if (result) {
      navigate(`/room/${result.room_code}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create a Room</h1>
        <p className="text-text-secondary mb-8">
          Set up a room and share the code with friends.
        </p>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <Input
            label="Your Name"
            placeholder="Your Name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            maxLength={50}
          />

          <Input
            label="Room Name"
            placeholder="Carpool to College"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={100}
          />

          {/* Meeting Point */}
          <div className="space-y-3">
            <Input
              label="Meeting Point (optional)"
              placeholder="College Main Gate"
              value={meetingPointName}
              onChange={(e) => setMeetingPointName(e.target.value)}
              maxLength={100}
            />

            <div className="h-48 rounded-xl overflow-hidden border border-white/10">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                className="w-full h-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <MeetingPointMarker
                  onSelect={handleMeetingSelect}
                  initialLat={meetingLat}
                  initialLng={meetingLng}
                />
              </MapContainer>
            </div>
            <p className="text-xs text-text-secondary">
              Click on the map to set a meeting point. Everyone will see distances and ETAs.
            </p>
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal open={!!result} onClose={() => setResult(null)}>
        {result && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold">Room Created!</h2>
              <p className="text-text-secondary text-sm mt-1">
                Share this code with friends
              </p>
            </div>

            <div className="glass rounded-xl py-4 px-6">
              <p className="text-3xl font-bold tracking-[0.3em] text-primary">
                {result.room_code}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={copyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button className="flex-1" onClick={enterRoom}>
                Enter Room
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
