from typing import Optional

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, DateTime, Float, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import settings
from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(9), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    host_session_id: Mapped[str] = mapped_column(String(64), nullable=False)
    meeting_point: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meeting_lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    meeting_lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=lambda: (datetime.now(timezone.utc) + timedelta(minutes=settings.room_expire_minutes)).replace(tzinfo=None),
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(), nullable=True)

    members = relationship("Member", back_populates="room", cascade="all, delete-orphan")
