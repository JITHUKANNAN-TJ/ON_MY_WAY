from app.schemas.location import LocationData

_store: dict[str, LocationData] = {}


def set_location(member_id: str, loc: LocationData) -> None:
    _store[member_id] = loc


def get_location(member_id: str) -> LocationData | None:
    return _store.get(member_id)


def remove_location(member_id: str) -> None:
    _store.pop(member_id, None)


def get_all_in_room(member_ids: list[str]) -> dict[str, LocationData]:
    return {mid: _store[mid] for mid in member_ids if mid in _store}


def clear() -> None:
    _store.clear()
