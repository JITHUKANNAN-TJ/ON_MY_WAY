import json
from fastapi import WebSocket

from app.ws.protocol import make_message


class ConnectionManager:
    def __init__(self) -> None:
        self._rooms: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, room_code: str, member_id: str, ws: WebSocket) -> None:
        await ws.accept()
        if room_code not in self._rooms:
            self._rooms[room_code] = {}
        self._rooms[room_code][member_id] = ws

    async def disconnect(self, room_code: str, member_id: str) -> None:
        if room_code in self._rooms:
            self._rooms[room_code].pop(member_id, None)
            if not self._rooms[room_code]:
                del self._rooms[room_code]

    async def send_to(self, room_code: str, member_id: str, msg_type: str, payload: dict) -> None:
        if room_code in self._rooms and member_id in self._rooms[room_code]:
            ws = self._rooms[room_code][member_id]
            try:
                await ws.send_json(make_message(msg_type, payload))
            except Exception:
                await self.disconnect(room_code, member_id)

    async def broadcast(self, room_code: str, msg_type: str, payload: dict, exclude: str | None = None) -> None:
        if room_code not in self._rooms:
            return
        message = make_message(msg_type, payload)
        disconnected = []
        for mid, ws in self._rooms[room_code].items():
            if mid == exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(mid)
        for mid in disconnected:
            await self.disconnect(room_code, mid)

    async def broadcast_raw(self, room_code: str, message: dict, exclude: str | None = None) -> None:
        if room_code not in self._rooms:
            return
        disconnected = []
        for mid, ws in self._rooms[room_code].items():
            if mid == exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(mid)
        for mid in disconnected:
            await self.disconnect(room_code, mid)

    def get_connected_members(self, room_code: str) -> set[str]:
        return set(self._rooms.get(room_code, {}).keys())

    def is_connected(self, room_code: str, member_id: str) -> bool:
        return room_code in self._rooms and member_id in self._rooms[room_code]


manager = ConnectionManager()
