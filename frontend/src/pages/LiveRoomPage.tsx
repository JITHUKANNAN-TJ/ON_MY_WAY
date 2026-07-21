import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveMap } from "@/components/map/LiveMap";
import { MemberList } from "@/components/room/MemberList";
import { RoomInfo } from "@/components/room/RoomInfo";
import { RoomControls } from "@/components/room/RoomControls";
import { LocationInfo } from "@/components/room/LocationInfo";
import { ConnectionBanner } from "@/components/room/ConnectionBanner";
import { PingBadge } from "@/components/ui/PingBadge";
import { useRoom } from "@/hooks/useRoom";
import { api } from "@/services/api";
import { MemberRole } from "@/types";

export function LiveRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const sessionId = localStorage.getItem("omw_session_id") || "";
  const displayName = localStorage.getItem("omw_display_name") || "";
  const role = (localStorage.getItem("omw_role") || "MEMBER") as MemberRole;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    room,
    members,
    myId,
    isHost,
    isViewer,
    connectionState,
    latency,
    leaveRoom,
  } = useRoom({
    roomCode: code || "",
    sessionId,
    displayName,
    role,
  });

  const handleLeave = useCallback(() => {
    leaveRoom();
    localStorage.removeItem("omw_session_id");
    localStorage.removeItem("omw_member_id");
    localStorage.removeItem("omw_display_name");
    localStorage.removeItem("omw_role");
    navigate("/");
  }, [leaveRoom, navigate]);

  const handleEndRoom = useCallback(async () => {
    if (!code) return;
    try {
      await api.endRoom(code, sessionId);
    } catch {
      // room ended via WS
    }
  }, [code, sessionId]);

  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    if (!code) return;
    const url = `${window.location.origin}/room/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [code]);

  const myMember = members.find((m) => m.id === myId);

  useEffect(() => {
    if (!sessionId || !displayName) {
      navigate("/join");
    }
  }, [sessionId, displayName, navigate]);

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Invalid room code</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col pt-16">
      {/* Top bar */}
      <div className="glass border-b border-white/5 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {room && <RoomInfo room={room} />}
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBanner state={connectionState} latency={latency} />
          <PingBadge latency={latency} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <LiveMap members={members} myId={myId} room={room} />

          {/* Mobile controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="glass px-4 py-2 rounded-xl text-sm font-medium"
            >
              {members.length} member{members.length !== 1 ? "s" : ""}
            </button>
            <button
              onClick={handleCopyLink}
              className="glass px-4 py-2 rounded-xl text-sm font-medium"
            >
              Share
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 fixed lg:relative right-0 top-16 bottom-0 w-80 glass border-l border-white/5 p-4 overflow-y-auto transition-transform duration-300 z-30 space-y-4`}
        >
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text ml-auto block"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Members */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">
              Members ({members.length})
            </h3>
            <MemberList members={members} myId={myId} />
          </div>

          {/* My Location */}
          {!isViewer && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">
                My Location
              </h3>
              <div className="glass rounded-xl px-3 py-2.5">
                <LocationInfo location={myMember?.location} />
              </div>
            </div>
          )}

          {/* Controls */}
          <RoomControls
            isHost={isHost}
            roomCode={code}
            onLeave={handleLeave}
            onEndRoom={handleEndRoom}
            onCopyLink={handleCopyLink}
          />
        </div>
      </div>
    </div>
  );
}
