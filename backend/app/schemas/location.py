from datetime import datetime, timezone

from pydantic import BaseModel


class LocationData(BaseModel):
    latitude: float
    longitude: float
    speed: float | None = None
    heading: float | None = None
    accuracy: float | None = None
    timestamp: float | None = None

    @property
    def dt(self) -> datetime:
        if self.timestamp:
            return datetime.fromtimestamp(self.timestamp / 1000, tz=timezone.utc)
        return datetime.now(timezone.utc)
