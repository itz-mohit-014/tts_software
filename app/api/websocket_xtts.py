from fastapi import WebSocket, APIRouter
import asyncio

router = APIRouter()

@router.websocket("/train-logs")
async def train_log_socket(websocket: WebSocket):
    await websocket.accept()
    for i in range(100):
        await websocket.send_text(f"Training step {i}")
        await asyncio.sleep(1)
    await websocket.close()
