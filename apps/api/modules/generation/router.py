from fastapi import APIRouter, Depends
from .schemas import GenerateRequest, RegionEditRequest
from .service import generate_pattern_service
from .edit_service import edit_region_service
from .models import AIGenerationLog
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_optional_current_user, get_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.auth.database import get_db
from sqlalchemy.orm import Session
from sqlalchemy.orm import Session
from typing import Optional

router = APIRouter()

import logging
from fastapi import HTTPException


@router.post("")
def generate_pattern(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_pattern_service(request.prompt, current_user, db)
        # ── Log every generation attempt ──────────────────────────────────────
        log = AIGenerationLog(
            user_id=current_user.id if current_user else None,
            prompt=request.prompt,
        )
        db.add(log)
        db.commit()
        return result
    except Exception as e:
        logging.exception("Error generating pattern")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/edit")
def edit_region(
    request: RegionEditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.account_tier == "FREE":
        raise HTTPException(status_code=403, detail="Tính năng chỉnh sửa vùng ảnh chỉ dành cho tài khoản Pro.")
    """
    Edit a region of an existing image based on a mask and prompt.

    - image_base64: The original image as base64 (without data URI prefix)
    - mask_base64: Mask image as base64 (white = area to edit, black = keep)
    - prompt: Description of what to change in the masked region
    """
    try:
        return edit_region_service(
            request.image_base64,
            request.mask_base64,
            request.prompt,
            current_user,
            db
        )
    except Exception as e:
        logging.exception("Error editing region")
        raise HTTPException(status_code=500, detail=str(e))
