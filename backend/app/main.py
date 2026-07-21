import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import async_session_factory, engine, Base
from app.services.room_service import expire_rooms
from app.ws.handlers import handle_connection
from app.ws.manager import manager
from app.api.rooms import router as rooms_router
from app.api.members import router as members_router

logger = logging.getLogger(__name__)


async def cleanup_expired_rooms() -> None:
    while True:
        try:
            async with async_session_factory() as db:
                expired = await expire_rooms(db)
                for room in expired:
                    logger.info(f"Room {room.code} expired")
                    await manager.broadcast(room.code, "room_ended", {})
                    for mid in list(manager.get_connected_members(room.code)):
                        await manager.disconnect(room.code, mid)
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    task = asyncio.create_task(cleanup_expired_rooms())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    await engine.dispose()


app = FastAPI(title="On My Way", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms_router)
app.include_router(members_router)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    session_id: str = Query(...),
    display_name: str = Query(""),
):
    await handle_connection(room_code.upper(), session_id, display_name, websocket)
