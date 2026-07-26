import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LiveMap } from "@/components/map/LiveMap";
import { MemberList } from "@/components/room/MemberList";
import { RoomInfo } from "@/components/room/RoomInfo";
import { RoomControls } from "@/components/room/RoomControls";
import { LocationInfo } from "@/components/room/LocationInfo";
import { ConnectionBanner } from "@/components/room/ConnectionBanner";
import { ChatBox } from "@/components/room/ChatBox";
import { PingBadge } from "@/components/ui/PingBadge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRoom } from "@/hooks/useRoom";
import { api } from "@/services/api";
import { MemberRole, ConnectionState, TransportMode } from "@/types";

export function LiveRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const sessionId = localStorage.getItem("omw_session_id") || "";
  const displayName = localStorage.getItem("omw_display_name") || "";
  const role = (localStorage.getItem("omw_role") || "MEMBER") as MemberRole;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>("car");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [endError, setEndError] = useState("");

  const {
    room,
    members,
    myId,
    isHost,
    isViewer,
    connectionState,
    latency,
    leaveRoom,
    chatMessages,
    sendChatMessage,
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
    setConfirmLeave(false);
    navigate("/");
  }, [leaveRoom, navigate]);

  const handleEndRoom = useCallback(async () => {
    if (!code) return;
    setEndError("");
    try {
      await api.endRoom(code, sessionId);
      setConfirmEnd(false);
    } catch (err) {
      setEndError(err instanceof Error ? err.message : "Failed to end room");
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

  const connectionDotClass = useMemo(() => {
    switch (connectionState) {
      case ConnectionState.CONNECTED: return "bg-primary animate-ping-slow";
      case ConnectionState.CONNECTING: return "bg-secondary";
      case ConnectionState.RECONNECTING: return "bg-warning animate-pulse";
      default: return "bg-danger";
    }
  }, [connectionState]);

  const handleToggleFullscreen = useCallback(() => {
    setMapFullscreen((prev) => !prev);
  }, []);

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
      <div className="h-screen w-full flex items-center justify-center pt-16">
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
    <div className={`h-screen w-full flex flex-col ${mapFullscreen ? "pt-0" : "pt-16"} overflow-hidden`}>
      {/* Top bar */}
      {!mapFullscreen && (
      <div className="glass-strong border-b border-white/[0.04] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {room && <RoomInfo room={room} />}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <ConnectionBanner state={connectionState} latency={latency} />
            <PingBadge latency={latency} />
          </div>
          {/* Compact connection dot on mobile */}
          <div className="flex sm:hidden items-center">
            <span className={`w-2 h-2 rounded-full ${connectionDotClass}`} />
          </div>
          <button
            onClick={() => { setChatOpen(false); setSidebarOpen(!sidebarOpen); }}
            className="btn-ghost p-2.5 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <button
            onClick={() => { setSidebarOpen(true); setChatOpen((c) => !c); }}
            className={`btn-ghost p-2.5 relative ${chatOpen ? "text-primary" : ""}`}
            aria-label="Toggle chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {chatMessages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                {chatMessages.length > 9 ? "9+" : chatMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map */}
        <div className="flex-1 relative">
          <LiveMap
            members={members}
            myId={myId}
            room={room}
            transportMode={transportMode}
            onTransportModeChange={setTransportMode}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={mapFullscreen}
          />

          {/* Mobile controls overlay */}
          {!mapFullscreen && (
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
          )}
        </div>

        {/* Sidebar */}
        <div
          className={`${mapFullscreen ? "hidden" : ""} ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 absolute lg:relative right-0 top-0 bottom-0 w-80 glass-strong border-l border-white/[0.04] transition-transform duration-300 ease-out z-30`}
        >
          {/* Close button on mobile */}
          <div className="flex items-center justify-between p-4 pb-0 lg:hidden">
            <span className="text-sm font-medium text-text-secondary">
              {chatOpen ? "Chat" : "Room Details"}
            </span>
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

          {/* Tabs on desktop */}
          <div className="hidden lg:flex items-center gap-1 px-4 pt-4 pb-2 border-b border-white/[0.04]">
            <button
              onClick={() => setChatOpen(false)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                !chatOpen
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Room
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                chatOpen
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              Chat
              {chatMessages.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                  {chatMessages.length > 9 ? "9+" : chatMessages.length}
                </span>
              )}
            </button>
          </div>

          {chatOpen ? (
            <div className="p-4 h-[calc(100%-3rem)]">
              <ChatBox
                messages={chatMessages}
                myId={myId}
                onSend={sendChatMessage}
              />
            </div>
          ) : (
            <div className="p-4 overflow-y-auto space-y-5 h-[calc(100%-3rem)]">
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
                  <div className="bg-white/[0.02] rounded-xl px-3.5 py-3 ring-1 ring-white/[0.06]">
                    <LocationInfo location={myMember?.location} />
                  </div>
                </div>
              )}

              {/* Controls */}
              <RoomControls
                isHost={isHost}
                roomCode={code}
                onLeave={() => setConfirmLeave(true)}
                onEndRoom={() => setConfirmEnd(true)}
                onCopyLink={handleCopyLink}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirm End Room */}
      <Modal open={confirmEnd} onClose={() => { setConfirmEnd(false); setEndError(""); }}>
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto ring-1 ring-danger/20">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">End Room?</h2>
            <p className="text-text-secondary text-sm mt-1">
              This will disconnect all members and end the session. This cannot be undone.
            </p>
          </div>
          {endError && (
            <div className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3 ring-1 ring-danger/20">
              {endError}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setConfirmEnd(false); setEndError(""); }}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleEndRoom}>
              End Room
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Leave Room */}
      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)}>
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto ring-1 ring-secondary/20">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M3 12h13.5m0 0l-3-3m3 3l-3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Leave Room?</h2>
            <p className="text-text-secondary text-sm mt-1">
              You can rejoin later if the room is still active.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setConfirmLeave(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleLeave} leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M3 12h13.5m0 0l-3-3m3 3l-3 3" />
              </svg>
            }>
              Leave Room
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}