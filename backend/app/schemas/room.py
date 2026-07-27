import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CreateRoomRequest(BaseModel):
    host_name: str = Field(..., min_length=1, max_length=50)
    room_name: str = Field(..., min_length=1, max_length=100)
    meeting_point: str | None = None
    meeting_lat: float | None = None
    meeting_lng: float | None = None


class CreateRoomResponse(BaseModel):
    room_id: uuid.UUID
    room_code: str
    share_link: str
    session_id: str
    member_id: uuid.UUID


class JoinRoomRequest(BaseModel):
    room_code: str = Field(..., min_length=1, max_length=9)
    display_name: str = Field(..., min_length=1, max_length=50)
    role: str = Field(default="MEMBER", pattern="^(MEMBER|VIEWER)$")
    session_id: str | None = None

    @field_validator("room_code")
    @classmethod
    def normalize_room_code(cls, v: str) -> str:
        return v.upper()


class JoinRoomResponse(BaseModel):
    room_id: uuid.UUID
    room_code: str
    room_name: str
    session_id: str
    member_id: uuid.UUID
    meeting_point: str | None = None
    meeting_lat: float | None = None
    meeting_lng: float | None = None


class EndRoomRequest(BaseModel):
    session_id: str


class RemoveMemberRequest(BaseModel):
    session_id: str


class RoomInfoResponse(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    is_active: bool
    created_at: datetime
    expires_at: datetime
    meeting_point: str | None = None
    meeting_lat: float | None = None
    meeting_lng: float | None = None
    member_count: int = 0

    model_config = {"from_attributes": True}
