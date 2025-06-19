from fastapi import FastAPI, HTTPException, Request, Depends,APIRouter,Form
# from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from bson.errors import InvalidId
from jose import jwt, JWTError
from email.message import EmailMessage
from app.db.mongo import users_collection, otp_collection
from app.models.user import (
    UserCreate, UserOut, EmailRequest, LoginRequest,
    TokenResponse, OTPVerifyRequest, UpdateUser,
    ForgetPasswordRequest, ResetPasswordRequest
)
from app.core.config import EMAIL_ADDRESS, EMAIL_PASSWORD, JWT_SECRET, JWT_ALGORITHM
from app.core.token_store import token_blacklist
import os
import time
import random
import smtplib
import uuid

auth_router = APIRouter()
security = HTTPBearer()

otp_store = {} # Temp store in memory

# config
SECRET_KEY = JWT_SECRET
ALGORITHM = JWT_ALGORITHM

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helpers
def hash_password(password: str):
    return pwd_context.hash(password)

def generate_otp():
    return str(random.randint(100000, 999999))

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(data: dict):
     payload = data.copy()
     payload["jti"] = str(uuid.uuid4())
     return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def send_email(recipient: str, otp: str):
    msg = EmailMessage()
    msg["Subject"] = "Your OTP Code"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = recipient
    msg.set_content(f"Your OTP code is: {otp}")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Utility to convert MongoDB object to dictionary
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "firstname": user["firstname"],
        "lastname": user["lastname"],
        "email": user["email"],
    }

# Token Auth Dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
):
    token = credentials.credentials

    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token has been logged out")

    try:
        payload = decode_jwt_token(token)
        if request:
            request.state.user = payload  # ✅ Store in request if needed
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


protected_router = APIRouter(
    prefix="/user",
    dependencies=[Depends(get_current_user)]  
)

# Routes
@auth_router.get("/protected")
async def protected_route(request: Request):
    user = request.state.user
    return {"message": f"Welcome {user['email']}"}

@auth_router.post("/create", response_model=UserOut)
async def create_user(user: UserCreate):
    try:
        
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        otp_record = await otp_collection.find_one({"email": user.email})
        if not otp_record:
            raise HTTPException(status_code=404, detail="OTP record not found")

        stored_otp = otp_record.get("otp")
        expiry_time = otp_record.get("otp_expiry", 0)

        if stored_otp is None or expiry_time == 0:
            raise HTTPException(status_code=400, detail="No OTP found for this user")

        if int(time.time()) > expiry_time:
            raise HTTPException(status_code=400, detail="OTP expired")

        if user.otp != stored_otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        hashed_pwd = hash_password(user.password)

        user_doc = {
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "password": hashed_pwd,
            "is_verified": True
        }

        result = await users_collection.insert_one(user_doc)
        new_user = await users_collection.find_one({"_id": result.inserted_id})

        await otp_collection.delete_one({"email": user.email})

        return user_helper(new_user)

    except Exception as e:
        print("🔥 Error occurred:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@auth_router.post("/login", response_model=TokenResponse)
async def login_user(data: LoginRequest):
    user = await users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=403, detail="Invalid credentials")

    token_payload = {
        "user_id": str(user["_id"]),
        "email": user["email"]
    }

    token = create_jwt_token(token_payload)

    return {
        "access_token": token, 
        "user_id": str(user["_id"]),
        }

@auth_router.post("/send-otp")
async def send_otp(data: EmailRequest):
    otp = generate_otp()
    expiry_time = int(time.time()) + 300  # 5 minutes
    result = await otp_collection.update_one(
         {"email": data.email.strip().lower()},  
        {"$set": {
            "otp": otp,
            "otp_expiry": expiry_time
        }},
        upsert=True  
    )

    await otp_collection.delete_one({"email": data.email.strip().lower()})
    
    if result.matched_count == 0:
        await otp_collection.insert_one({
            "email": data.email.strip().lower(),
            "otp": otp,
            "otp_expiry": expiry_time
        })

    send_email(data.email, otp)
    return {"message": f"OTP sent to {data.email}"}

@auth_router.post("/verify-otp")
async def verify_otp(data: OTPVerifyRequest):
    user = await otp_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stored_otp = user.get("otp")
    expiry_time = user.get("otp_expiry", 0)

    if data.otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if stored_otp is None or expiry_time == 0 or int(time.time()) > expiry_time:
        raise HTTPException(status_code=403, detail="OTP expired or not verified")

    return {"message": "OTP verified successfully"}

@auth_router.put("/profile/{user_id}")
async def update_user(user_id: str, updates: UpdateUser):
    try:
        obj_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await users_collection.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_email = user["email"].strip().lower()  # ✅ Email from DB
    otp_record = await otp_collection.find_one({"email": user_email})

    if not otp_record:
        raise HTTPException(status_code=403, detail="OTP verification required")

    stored_otp = otp_record.get("otp")
    expiry_time = otp_record.get("otp_expiry", 0)

    if stored_otp is None or expiry_time == 0 or int(time.time()) > expiry_time:
        raise HTTPException(status_code=403, detail="OTP expired or not verified")

    await otp_collection.delete_one({"email": user_email})

    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])

    result = await users_collection.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found during update")

    return {"message": "User profile updated successfully"}

@auth_router.get("/profile/{user_id}")
async def get_user_profile(user_id: str, user_data: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await users_collection.find_one({"_id": obj_id}, {"password": 0}) 

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"]) 
    return user

@auth_router.post("/forget")
async def forget_password(data: ForgetPasswordRequest):
    user = await users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    expiry_time = int(time.time()) + 300 

    otp = str(random.randint(100000, 999999))

    result = await otp_collection.update_one(
         {"email": data.email.strip().lower()}, 
        {"$set": {
            "otp": otp,
            "otp_expiry": expiry_time
        }},
        upsert=True  
    )

    if result.matched_count == 0:
        await otp_collection.insert_one({
            "email": data.email,
            "otp": otp,
            "otp_expiry": expiry_time
        })
    
    send_email(data.email, otp)

    return {"message": "OTP has been sent to your email"}

@auth_router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    user = await users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_otp_record = await otp_collection.find_one({"email": data.email})

    if not user_otp_record:
        raise HTTPException(status_code=404, detail="OTP record not found")
    
    if user_otp_record.get("otp") != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    hashed_pwd = hash_password(data.new_password)

    await users_collection.update_one(
        {"email": data.email},
        {"$set": {"password": hashed_pwd}, "$unset": {"otp": ""}}
    )

    await otp_collection.delete_one({"email": data.email})

    return {"message": "Password has been reset successfully"}

@auth_router.post("/logout")
async def logout(request: Request):
    token = request.headers.get("Authorization")
    
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    token_value = token.split(" ")[1]
    
    if token_value in token_blacklist:
        return {"message": "Token already logged out"}
    
    token_blacklist.add(token_value)

    return {"message": "Logged out successfully"}
