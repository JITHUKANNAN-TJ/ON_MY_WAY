from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.member import Member
from app.models.room import Room
from app.schemas.location import LocationData, LocationUpdateRequest
from app.services.location_store import add_location, get_trail
from app.services.meeting_point import calculate_eta
from app.ws.manager import manager

router = APIRouter(prefix="/api/rooms", tags=["location"])


@router.post("/{code}/location")
async def update_location(
    code: str,
    req: LocationUpdateRequest,
    db: AsyncSession = Depends(get_session),
) -> dict:
    result = await db.execute(
        select(Room).where(Room.code == code.upper(), Room.is_active == True)
    )
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    member_result = await db.execute(
        select(Member).where(
            Member.room_id == room.id,
            Member.session_id == req.session_id,
            Member.status != "LEFT",
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member_id_str = str(member.id)

    loc = LocationData(
        latitude=req.lat,
        longitude=req.lng,
        speed=req.speed,
        heading=req.heading,
        accuracy=req.accuracy,
        timestamp=req.timestamp,
    )

    add_location(member_id_str, loc)

    broadcast_payload = {
        "member_id": member_id_str,
        "lat": loc.latitude,
        "lng": loc.longitude,
        "speed": loc.speed,
        "heading": loc.heading,
        "accuracy": loc.accuracy,
        "timestamp": loc.timestamp,
    }
    await manager.broadcast(code, "location_update", broadcast_payload, exclude=member_id_str)

    trail = get_trail(member_id_str)
    await manager.broadcast(
        code,
        "trail_update",
        {
            "member_id": member_id_str,
            "trail": [{"lat": t.latitude, "lng": t.longitude} for t in trail],
        },
    )

    if room.meeting_lat is not None and room.meeting_lng is not None:
        distance, eta = calculate_eta(room.meeting_lat, room.meeting_lng, loc)
        await manager.broadcast(
            code,
            "eta_update",
            {"member_id": member_id_str, "distance_km": distance, "eta_min": eta},
        )

    member.status = "ONLINE"
    await db.commit()

    return {"message": "ok"}
