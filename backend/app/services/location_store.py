from collections import deque

from app.schemas.location import LocationData

MAX_TRAIL_LENGTH = 100

_store: dict[str, deque[LocationData]] = {}


def add_location(member_id: str, loc: LocationData) -> None:
    if member_id not in _store:
        _store[member_id] = deque(maxlen=MAX_TRAIL_LENGTH)
    _store[member_id].append(loc)


def get_latest(member_id: str) -> LocationData | None:
    trail = _store.get(member_id)
    if trail:
        return trail[-1]
    return None


def get_trail(member_id: str) -> list[LocationData]:
    trail = _store.get(member_id)
    return list(trail) if trail else []


def remove_location(member_id: str) -> None:
    _store.pop(member_id, None)


def get_all_in_room(member_ids: list[str]) -> dict[str, LocationData]:
    result = {}
    for mid in member_ids:
        latest = get_latest(mid)
        if latest:
            result[mid] = latest
    return result


def clear() -> None:
    _store.clear()
