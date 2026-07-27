import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import Member
from app.models.room import Room
from app.schemas.room import CreateRoomRequest, JoinRoomRequest
from app.utils.room_code import generate_room_code


async def create_room(db: AsyncSession, req: CreateRoomRequest) -> tuple[Room, Member, str]:
    session_id = str(uuid.uuid4())
    code = generate_room_code()

    room = Room(
        code=code,
        name=req.room_name,
        host_session_id=session_id,
        meeting_point=req.meeting_point,
        meeting_lat=req.meeting_lat,
        meeting_lng=req.meeting_lng,
    )
    db.add(room)
    await db.flush()

    host = Member(
        room_id=room.id,
        session_id=session_id,
        display_name=req.host_name,
        role="HOST",
        status="ONLINE",
    )
    db.add(host)
    await db.flush()
    await db.commit()

    return room, host, session_id


async def join_room(db: AsyncSession, req: JoinRoomRequest) -> tuple[Room, Member, str] | None:
    result = await db.execute(select(Room).where(Room.code == req.room_code, Room.is_active == True))
    room = result.scalar_one_or_none()
    if not room:
        return None

    if datetime.now(timezone.utc).replace(tzinfo=None) > room.expires_at:
        room.is_active = False
        await db.commit()
        return None

    # If a session_id is provided, try to reuse the existing member
    if req.session_id:
        existing = await db.execute(
            select(Member).where(
                Member.room_id == room.id,
                Member.session_id == req.session_id,
                Member.status != "LEFT",
            )
        )
        member = existing.scalar_one_or_none()
        if member:
            member.display_name = req.display_name
            member.status = "ONLINE"
            await db.commit()
            await db.refresh(member)
            return room, member, req.session_id

    session_id = str(uuid.uuid4())

    member = Member(
        room_id=room.id,
        session_id=session_id,
        display_name=req.display_name,
        role=req.role,
        status="ONLINE" if req.role == "VIEWER" else "ONLINE",
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return room, member, session_id


async def get_room_by_code(db: AsyncSession, code: str) -> Room | None:
    result = await db.execute(select(Room).where(Room.code == code.upper()))
    return result.scalar_one_or_none()


async def get_room_members(db: AsyncSession, room_id: uuid.UUID) -> list[Member]:
    result = await db.execute(
        select(Member).where(Member.room_id == room_id, Member.status != "LEFT").order_by(Member.joined_at)
    )
    return list(result.scalars().all())


async def end_room(db: AsyncSession, room_id: uuid.UUID, session_id: str) -> bool:
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room or room.host_session_id != session_id:
        return False
    room.is_active = False
    room.ended_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    return True


async def remove_member(db: AsyncSession, room_id: uuid.UUID, member_id: uuid.UUID, host_session_id: str) -> bool:
    result = await db.execute(select(Room).where(Room.id == room_id, Room.host_session_id == host_session_id))
    room = result.scalar_one_or_none()
    if not room:
        return False

    result = await db.execute(
        select(Member).where(Member.id == member_id, Member.room_id == room_id, Member.status != "LEFT")
    )
    member = result.scalar_one_or_none()
    if not member:
        return False

    member.status = "LEFT"
    member.left_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    return True


async def expire_rooms(db: AsyncSession) -> list[Room]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = await db.execute(
        select(Room).where(Room.is_active == True, Room.expires_at <= now)
    )
    rooms = list(result.scalars().all())
    for room in rooms:
        room.is_active = False
        room.ended_at = now
    await db.commit()
    return rooms
