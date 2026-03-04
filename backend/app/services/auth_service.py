from datetime import datetime, timedelta, timezone
import os

from jose import jwt, JWTError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(subject: str) -> str:
    secret = os.getenv("JWT_SECRET", "change-me")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expires_in_minutes = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=expires_in_minutes)
    payload = {"sub": subject, "iat": now, "exp": expire}

    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_token(token: str) -> str:
    """Decode JWT token and return the subject (user_id). Raises JWTError if invalid."""
    secret = os.getenv("JWT_SECRET", "change-me")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    
    payload = jwt.decode(token, secret, algorithms=[algorithm])
    subject = payload.get("sub")
    
    if subject is None:
        raise JWTError("Invalid token payload")
    
    return subject
