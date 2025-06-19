from fastapi import APIRouter, Form

auth_router = APIRouter()

@auth_router.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "secret":
        return {"success": True, "token": "abc123"}
    return {"success": False}
