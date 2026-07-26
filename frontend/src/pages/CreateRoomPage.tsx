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

    if (!hostName.trim()) { setError("Enter your name"); return; }
    if (!roomName.trim()) { setError("Enter a room name"); return; }

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
    if (result) navigate(`/room/${result.room_code}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Create a Room</h1>
          <p className="text-text-secondary">
            Set up a room and share the code with friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-5">
            <Input
              label="Your Name"
              placeholder="Your Name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              maxLength={50}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
            />

            <Input
              label="Room Name"
              placeholder="Carpool to College"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={100}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              }
            />

            <div className="space-y-3">
              <Input
                label="Meeting Point (optional)"
                placeholder="College Main Gate"
                value={meetingPointName}
                onChange={(e) => setMeetingPointName(e.target.value)}
                maxLength={100}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                }
              />

              <div className="h-48 rounded-xl overflow-hidden border border-white/[0.06]">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  className="w-full h-full"
                  scrollWheelZoom={true}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution=""
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
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3 ring-1 ring-danger/20 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? "Creating Room..." : "Create Room"}
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal open={!!result} onClose={() => setResult(null)}>
        {result && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-1 ring-primary/20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Room Created!</h2>
              <p className="text-text-secondary text-sm mt-1">
                Share this code with friends
              </p>
            </div>

            <div className="bg-white/[0.03] rounded-2xl py-5 px-6 ring-1 ring-white/[0.06]">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.2em] text-primary font-mono">
                {result.room_code}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={copyLink}>
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button className="flex-1" onClick={enterRoom} rightIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              }>
                Enter Room
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
