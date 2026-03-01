from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.designs.models import SavedDesign

router = APIRouter()

# Schemas
class SavedDesignCreate(BaseModel):
    image_url: str
    prompt: str | None = None

class SavedDesignResponse(BaseModel):
    id: str
    user_id: str
    image_url: str
    prompt: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("", response_model=SavedDesignResponse)
async def save_design(
    design_data: SavedDesignCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    new_design = SavedDesign(
        user_id=user.id,
        image_url=design_data.image_url,
        prompt=design_data.prompt
    )
    db.add(new_design)
    db.commit()
    db.refresh(new_design)
    return new_design

@router.get("", response_model=List[SavedDesignResponse])
async def get_my_designs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    designs = db.query(SavedDesign).filter(SavedDesign.user_id == user.id).order_by(SavedDesign.created_at.desc()).all()
    return designs

@router.delete("/{design_id}")
async def delete_design(
    design_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    design = db.query(SavedDesign).filter(
        SavedDesign.id == design_id,
        SavedDesign.user_id == user.id
    ).first()
    
    if not design:
        raise HTTPException(status_code=404, detail="Design not found or you don't have permission")
        
    db.delete(design)
    db.commit()
    return {"message": "Design deleted successfully"}
