import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.room import Room
from app.schemas.room import (
    CreateRoomRequest,
    CreateRoomResponse,
    EndRoomRequest,
    JoinRoomRequest,
    JoinRoomResponse,
    RoomInfoResponse,
)
from app.schemas.member import MemberResponse
from app.services.room_service import create_room, get_room_by_code, get_room_members, join_room

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.post("", response_model=CreateRoomResponse, status_code=201)
async def create_room_endpoint(req: CreateRoomRequest, db: AsyncSession = Depends(get_session)) -> CreateRoomResponse:
    room, host, session_id = await create_room(db, req)
    return CreateRoomResponse(
        room_id=room.id,
        room_code=room.code,
        share_link=f"/room/{room.code}",
        session_id=session_id,
        member_id=host.id,
    )


@router.post("/join", response_model=JoinRoomResponse)
async def join_room_endpoint(req: JoinRoomRequest, db: AsyncSession = Depends(get_session)) -> JoinRoomResponse:
    result = await join_room(db, req)
    if not result:
        raise HTTPException(status_code=404, detail="Room not found or expired")
    room, member, session_id = result
    return JoinRoomResponse(
        room_id=room.id,
        room_code=room.code,
        room_name=room.name,
        session_id=session_id,
        member_id=member.id,
        meeting_point=room.meeting_point,
        meeting_lat=room.meeting_lat,
        meeting_lng=room.meeting_lng,
    )


@router.get("/{code}", response_model=RoomInfoResponse)
async def get_room_info(code: str, db: AsyncSession = Depends(get_session)) -> RoomInfoResponse:
    room = await get_room_by_code(db, code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    members = await get_room_members(db, room.id)
    return RoomInfoResponse(
        id=room.id,
        code=room.code,
        name=room.name,
        is_active=room.is_active,
        created_at=room.created_at,
        expires_at=room.expires_at,
        meeting_point=room.meeting_point,
        meeting_lat=room.meeting_lat,
        meeting_lng=room.meeting_lng,
        member_count=len(members),
    )


@router.get("/{code}/members", response_model=list[MemberResponse])
async def get_members(code: str, db: AsyncSession = Depends(get_session)) -> list[MemberResponse]:
    room = await get_room_by_code(db, code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    members = await get_room_members(db, room.id)
    return [MemberResponse.model_validate(m) for m in members]


@router.delete("/{code}")
async def end_room(
    code: str, req: EndRoomRequest, db: AsyncSession = Depends(get_session)
) -> dict:
    from app.services.room_service import end_room as end_room_svc

    room = await get_room_by_code(db, code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    success = await end_room_svc(db, room.id, req.session_id)
    if not success:
        raise HTTPException(status_code=403, detail="Only the host can end the room")

    from app.ws.manager import manager

    await manager.broadcast(code, "room_ended", {})
    for mid in list(manager.get_connected_members(code)):
        await manager.disconnect(code, mid)

    return {"message": "Room ended"}
