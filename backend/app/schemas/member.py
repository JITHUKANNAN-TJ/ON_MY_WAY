import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MemberResponse(BaseModel):
    id: uuid.UUID
    display_name: str
    role: str
    status: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class RemoveMemberRequest(BaseModel):
    member_id: uuid.UUID
