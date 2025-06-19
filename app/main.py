from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

from typing import List
from contextlib import asynccontextmanager
import os
from pathlib import Path

from app.core.token_store import token_blacklist

# Import routers
from app.api import auth
from app.db.mongo import otp_collection  
from app.core.config import JWT_ALGORITHM, JWT_SECRET


# App lifespan event for DB indexes etc.
@asynccontextmanager
async def lifespan(app: FastAPI):
    await otp_collection.create_index("email", unique=True)
    yield

# app
app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public (no-auth) paths
EXEMPT_PATHS: List[str] = [
    "/api/auth/login",
    "/api/auth/create",
    "/api/auth/send-otp",
    "/api/auth/verify-otp",
    "/api/auth/forget",
    "/api/auth/reset-password",
    "/docs",
    "/openapi.json"
]

# JWT decoding
def decode_jwt_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

class JWTMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, JWT_SECRET: str, exempt_paths: List[str]):
        super().__init__(app)
        self.JWT_SECRET = JWT_SECRET
        self.exempt_paths = [p.rstrip("/").lower() for p in exempt_paths]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path.rstrip("/").lower()

        # Allow requests to exempt paths or static files (frontend)
        if (
            any(path.startswith(p) for p in self.exempt_paths)
            or path.startswith("/_next")
            or path.startswith("/favicon")
            or "/static/" in path
            or any(path.endswith(ext) for ext in [
                ".html", ".js", ".css", ".jpg", ".jpeg", ".png", ".svg", ".woff", ".ttf"
            ])
        ):

            return await call_next(request)

        if request.method == "OPTIONS" or path in self.exempt_paths:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid token"})

        token = auth_header.split(" ")[1]
        if token in token_blacklist:
            return JSONResponse(status_code=401, content={"detail": "Token has been logged out"})

        try:
            payload = decode_jwt_token(token)
            request.state.user = payload
        except JWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)

# Add JWT middleware
app.add_middleware(
    JWTMiddleware,
    JWT_SECRET=JWT_SECRET,
    exempt_paths=EXEMPT_PATHS
)

# Register routers
app.include_router(auth.auth_router, prefix="/api/auth", tags=["auth"])
# app.include_router(tts.tts_router, prefix="/api/tts", tags=["tts"])
# app.include_router(websocket.websocket_router, tags=["websocket"])


# Serve static files
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

# Local dev run
if __name__ == "__main__":
    import uvicorn
    print("⚙️ Server is running at http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)