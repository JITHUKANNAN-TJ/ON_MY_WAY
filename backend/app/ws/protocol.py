VERSION = 1


def make_message(msg_type: str, payload: dict) -> dict:
    return {"version": VERSION, "type": msg_type, "payload": payload}
