import secrets

CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_room_code() -> str:
    part1 = "".join(secrets.choice(CHARSET) for _ in range(4))
    part2 = "".join(secrets.choice(CHARSET) for _ in range(4))
    return f"{part1}-{part2}"
