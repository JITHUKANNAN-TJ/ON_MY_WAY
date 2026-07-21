import json
import time
import uuid
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.member import Member
from app.models.room import Room
from app.schemas.location import LocationData
from app.schemas.member import MemberResponse
from app.services.location_store import get_all_in_room, remove_location, set_location
from app.services.meeting_point import calculate_eta
from app.ws.manager import manager
from app.ws.protocol import VERSION, make_message


async def handle_connection(room_code: str, session_id: str, display_name: str, ws: WebSocket) -> None:
    async with async_session_factory() as db:
        result = await db.execute(
            select(Room).where(Room.code == room_code, Room.is_active == True)
        )
        room = result.scalar_one_or_none()
        if not room:
            await ws.accept()
            await ws.send_json(make_message("error", {"message": "Room not found or expired"}))
            await ws.close()
            return

        result = await db.execute(
            select(Member).where(
                Member.room_id == room.id,
                Member.session_id == session_id,
                Member.status != "LEFT",
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            await ws.accept()
            await ws.send_json(make_message("error", {"message": "Member not found"}))
            await ws.close()
            return

        member.status = "ONLINE"
        await db.commit()

        member_id_str = str(member.id)
        await manager.connect(room_code, member_id_str, ws)

        members = await _get_member_list(db, room.id)
        room_data = {
            "id": str(room.id),
            "code": room.code,
            "name": room.name,
            "meeting_point": room.meeting_point,
            "meeting_lat": room.meeting_lat,
            "meeting_lng": room.meeting_lng,
        }

        await manager.send_to(
            room_code,
            member_id_str,
            "welcome",
            {
                "member_id": member_id_str,
                "session_id": session_id,
                "role": member.role,
                "members": members,
                "room": room_data,
            },
        )

        await manager.broadcast(
            room_code,
            "member_joined",
            {"member": {"id": member_id_str, "display_name": member.display_name, "role": member.role, "status": "ONLINE"}},
            exclude=member_id_str,
        )

    try:
        await _message_loop(room_code, member_id_str, member, ws)
    except WebSocketDisconnect:
        pass
    finally:
        await _handle_disconnect(room_code, member_id_str)


async def _message_loop(room_code: str, member_id_str: str, member: Member, ws: WebSocket) -> None:
    async with async_session_factory() as db:
        result = await db.execute(
            select(Room).where(Room.id == member.room_id)
        )
        room = result.scalar_one_or_none()

        while True:
            try:
                raw = await ws.receive_text()
            except WebSocketDisconnect:
                raise
            except Exception:
                break

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")
            payload = data.get("payload", {})

            try:
                if msg_type == "ping":
                    await manager.send_to(
                        room_code,
                        member_id_str,
                        "pong",
                        {"client_ts": payload.get("client_ts"), "server_ts": int(time.time() * 1000)},
                    )

                elif msg_type == "location_update":
                    loc = LocationData(
                        latitude=payload.get("lat"),
                        longitude=payload.get("lng"),
                        speed=payload.get("speed"),
                        heading=payload.get("heading"),
                        accuracy=payload.get("accuracy"),
                        timestamp=payload.get("timestamp", int(time.time() * 1000)),
                    )
                    if loc.latitude is None or loc.longitude is None:
                        continue

                    set_location(member_id_str, loc)

                    broadcast_payload = {
                        "member_id": member_id_str,
                        "lat": loc.latitude,
                        "lng": loc.longitude,
                        "speed": loc.speed,
                        "heading": loc.heading,
                        "accuracy": loc.accuracy,
                        "timestamp": loc.timestamp,
                    }
                    await manager.broadcast(room_code, "location_update", broadcast_payload, exclude=member_id_str)

                    if room and room.meeting_lat is not None and room.meeting_lng is not None:
                        distance, eta = calculate_eta(room.meeting_lat, room.meeting_lng, loc)
                        await manager.broadcast(
                            room_code,
                            "eta_update",
                            {"member_id": member_id_str, "distance_km": distance, "eta_min": eta},
                        )

                    member.status = "ONLINE"
                    await db.commit()

                elif msg_type == "gps_lost":
                    member.status = "GPS_LOST"
                    await db.commit()
                    await manager.broadcast(
                        room_code, "member_status_change", {"member_id": member_id_str, "status": "GPS_LOST"}
                    )

                elif msg_type == "leave_room":
                    member.status = "LEFT"
                    member.left_at = datetime.now(timezone.utc).replace(tzinfo=None)
                    await db.commit()
                    await manager.broadcast(room_code, "member_left", {"member_id": member_id_str})
                    remove_location(member_id_str)
                    await manager.disconnect(room_code, member_id_str)
                    break
            except Exception:
                continue


async def _handle_disconnect(room_code: str, member_id_str: str) -> None:
    await manager.disconnect(room_code, member_id_str)
    async with async_session_factory() as db:
        result = await db.execute(
            select(Member).where(Member.id == uuid.UUID(member_id_str))
        )
        member = result.scalar_one_or_none()
        if member and member.status != "LEFT":
            member.status = "OFFLINE"
            await db.commit()
            await manager.broadcast(
                room_code, "member_status_change", {"member_id": member_id_str, "status": "OFFLINE"}
            )
    remove_location(member_id_str)


async def _get_member_list(db: AsyncSession, room_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(Member).where(Member.room_id == room_id, Member.status != "LEFT")
    )
    members = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "display_name": m.display_name,
            "role": m.role,
            "status": m.status,
        }
        for m in members
    ]
