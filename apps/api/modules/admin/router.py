from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_admin_user
from apps.api.modules.auth.models import User
from apps.api.modules.auth.schemas import UserResponse
from pydantic import BaseModel, Field

router = APIRouter()

class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(USER|ADMIN)$", description="Role must be USER or ADMIN")

class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List all users (Admin only)"""
    query = db.query(User)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(User.full_name.ilike(search_term) | User.phone_number.ilike(search_term))
    
    total = query.count()
    offset = (page - 1) * page_size
    users = query.offset(offset).limit(page_size).all()
    
    import math
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return UserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Update user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Delete a user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent deleting yourself
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()
