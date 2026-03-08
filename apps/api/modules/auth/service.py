from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from apps.api.modules.auth.models import User
from apps.api.modules.auth.database import get_db
from typing import Optional
import os

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Security scheme
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash a plain password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_user(db: Session, phone_number: str, full_name: str, password: str) -> User:
    """Create a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.phone_number == phone_number).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new user
    hashed_password = hash_password(password)
    user = User(
        phone_number=phone_number,
        full_name=full_name,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, phone_number: str, password: str) -> Optional[User]:
    """Authenticate a user by phone number and password"""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user

def create_access_token(data: dict) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if token provided, else return None"""
    if credentials is None:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user if (user and user.is_active) else None
    except JWTError:
        return None

def update_user(db: Session, user: User, full_name: str) -> User:
    """Update user profile"""
    user.full_name = full_name
    db.commit()
    db.refresh(user)
    return user

def change_password(db: Session, user: User, current_password: str, new_password: str) -> User:
    """Change user password"""
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Validate that the current user is an admin"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def upgrade_to_pro(db: Session, user: User, duration_days: int = 30) -> User:
    """Upgrade user to PRO tier"""
    from datetime import timedelta
    
    now = datetime.utcnow()
    
    # If already PRO and active, extend the subscription
    if user.account_tier == "PRO" and user.pro_subscription_status == "ACTIVE":
        # Extend from current end date if it exists and is in the future
        if user.pro_subscription_end and user.pro_subscription_end > now:
            user.pro_subscription_end = user.pro_subscription_end + timedelta(days=duration_days)
        else:
            # Expired or no end date, start fresh
            user.pro_subscription_start = now
            user.pro_subscription_end = now + timedelta(days=duration_days)
    else:
        # New PRO subscription
        user.account_tier = "PRO"
        user.pro_subscription_status = "ACTIVE"
        user.pro_subscription_start = now
        user.pro_subscription_end = now + timedelta(days=duration_days)
    
    # Reset daily credits for PRO tier (PRO users get 20 daily credits)
    user.daily_credits_remaining = 20
    user.daily_credits_reset_at = now + timedelta(days=1)
    
    db.commit()
    db.refresh(user)
    return user

def check_and_update_subscription_status(db: Session, user: User) -> User:
    """Check and update user subscription status if expired"""
    now = datetime.utcnow()
    
    if user.account_tier == "PRO" and user.pro_subscription_end:
        if user.pro_subscription_end < now and user.pro_subscription_status == "ACTIVE":
            # Subscription expired
            user.pro_subscription_status = "EXPIRED"
            user.account_tier = "FREE"
            # Reset daily credits to FREE tier limit
            user.daily_credits_remaining = 5
            db.commit()
            db.refresh(user)
    
    return user

def get_subscription_status(user: User) -> dict:
    """Get user subscription status information"""
    from datetime import datetime
    
    result = {
        "account_tier": user.account_tier,
        "subscription_status": user.pro_subscription_status,
        "subscription_start": user.pro_subscription_start,
        "subscription_end": user.pro_subscription_end,
        "days_remaining": None
    }
    
    if user.account_tier == "PRO" and user.pro_subscription_end:
        now = datetime.utcnow()
        if user.pro_subscription_end > now:
            delta = user.pro_subscription_end - now
            result["days_remaining"] = delta.days + 1  # Include current day
        else:
            result["days_remaining"] = 0
    
    return result
