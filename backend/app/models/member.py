from typing import Optional

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

MEMBER_ROLES = ("HOST", "MEMBER", "VIEWER")
MEMBER_STATUSES = ("ONLINE", "GPS_LOST", "OFFLINE", "LEFT")


class Member(Base):
    __tablename__ = "room_members"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    room_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("rooms.id"), nullable=False)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False)
    display_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(10), default="MEMBER")
    status: Mapped[str] = mapped_column(String(10), default="ONLINE")
    joined_at: Mapped[datetime] = mapped_column(DateTime(), default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime(), nullable=True)

    room = relationship("Room", back_populates="members")
