from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from apps.api.modules.auth.schemas import (
    RegisterRequest, RegisterResponse, 
    LoginRequest, TokenResponse, UserResponse
)
from apps.api.modules.auth.service import (
    create_user, authenticate_user, create_access_token, get_current_user
)
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.models import User

router = APIRouter()

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with phone number and password"""
    try:
        user = create_user(
            db=db,
            phone_number=request.phone_number,
            full_name=request.full_name,
            password=request.password
        )
        
        return RegisterResponse(
            user_id=str(user.id),
            phone_number=user.phone_number,
            full_name=user.full_name
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with phone number and password"""
    user = authenticate_user(db, request.phone_number, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            phone_number=user.phone_number,
            full_name=user.full_name,
            created_at=user.created_at,
            is_active=user.is_active
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        phone_number=current_user.phone_number,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )
