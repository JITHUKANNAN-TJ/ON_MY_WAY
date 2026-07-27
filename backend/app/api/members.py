import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.room import Room
from app.schemas.room import RemoveMemberRequest
from app.services.room_service import get_room_by_code, remove_member

router = APIRouter(prefix="/api/rooms/{code}/members", tags=["members"])


@router.delete("/{member_id}")
async def remove_member_endpoint(
    code: str, member_id: uuid.UUID, req: RemoveMemberRequest, db: AsyncSession = Depends(get_session)
) -> dict:
    room = await get_room_by_code(db, code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    success = await remove_member(db, room.id, member_id, req.session_id)
    if not success:
        raise HTTPException(status_code=403, detail="Only the host can remove members")

    from app.ws.manager import manager

    await manager.send_to(code, str(member_id), "member_removed", {"member_id": str(member_id)})
    await manager.disconnect(code, str(member_id))

    return {"message": "Member removed"}
