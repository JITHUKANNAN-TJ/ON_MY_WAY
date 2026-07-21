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
import { MemberRole, ConnectionState } from "@/types";

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

  if (connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.DISCONNECTED) {
    return (
      <div className="h-screen w-screen flex items-center justify-center pt-16">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-1 ring-primary/20">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-text-secondary">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col pt-16">
      {/* Top bar */}
      <div className="glass-strong border-b border-white/[0.04] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {room && <RoomInfo room={room} />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConnectionBanner state={connectionState} latency={latency} />
          <PingBadge latency={latency} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
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
              className="glass-strong px-4 py-2.5 rounded-xl text-sm font-medium backdrop-blur-xl"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
            </button>
            <button
              onClick={handleCopyLink}
              className="glass-strong px-4 py-2.5 rounded-xl text-sm font-medium backdrop-blur-xl"
            >
              Share
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 fixed lg:relative right-0 top-16 bottom-0 w-80 glass-strong border-l border-white/[0.04] p-4 overflow-y-auto transition-transform duration-300 ease-out z-30 space-y-5`}
        >
          {/* Close button on mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <span className="text-sm font-medium text-text-secondary">Room Details</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-text-secondary hover:text-text transition-colors p-1"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Members
              </h3>
              <span className="text-xs text-text-secondary">{members.length}</span>
            </div>
            <MemberList members={members} myId={myId} />
          </div>

          {/* My Location */}
          {!isViewer && (
            <div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                My Location
              </h3>
              <div className="bg-white/[0.02] rounded-xl px-3.5 py-3 ring-1 ring-white/[0.04]">
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
