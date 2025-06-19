from passlib.context import CryptContext
from jose import jwt, JWTError
from core.config import JWT_SECRET, ALGORITHM
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_jwt_token(data: dict):
    payload = data.copy()
    payload["jti"] = str(uuid.uuid4())
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

def decode_jwt_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
