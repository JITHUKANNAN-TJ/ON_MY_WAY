const API_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  createRoom(body: {
    host_name: string;
    room_name: string;
    meeting_point?: string;
    meeting_lat?: number;
    meeting_lng?: number;
  }) {
    return request<{
      room_id: string;
      room_code: string;
      share_link: string;
      session_id: string;
      member_id: string;
    }>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  joinRoom(body: { room_code: string; display_name: string; role: string }) {
    return request<{
      room_id: string;
      room_code: string;
      room_name: string;
      session_id: string;
      member_id: string;
      meeting_point: string | null;
      meeting_lat: number | null;
      meeting_lng: number | null;
    }>("/api/rooms/join", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getRoom(code: string) {
    return request<{
      id: string;
      code: string;
      name: string;
      is_active: boolean;
      created_at: string;
      expires_at: string;
      meeting_point: string | null;
      meeting_lat: number | null;
      meeting_lng: number | null;
      member_count: number;
    }>(`/api/rooms/${code}`);
  },

  getMembers(code: string) {
    return request<
      {
        id: string;
        display_name: string;
        role: string;
        status: string;
        joined_at: string;
      }[]
    >(`/api/rooms/${code}/members`);
  },

  endRoom(code: string, sessionId: string) {
    return request<{ message: string }>(`/api/rooms/${code}?session_id=${sessionId}`, {
      method: "DELETE",
    });
  },

  removeMember(code: string, memberId: string, sessionId: string) {
    return request<{ message: string }>(
      `/api/rooms/${code}/members/${memberId}?session_id=${sessionId}`,
      { method: "DELETE" }
    );
  },
};
