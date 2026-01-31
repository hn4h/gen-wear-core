from fastapi import APIRouter
from .schemas import GenerateRequest, RegionEditRequest
from .service import generate_pattern_service
from .edit_service import edit_region_service

router = APIRouter()

import logging
from fastapi import HTTPException

@router.post("")
def generate_pattern(request: GenerateRequest):
    try:
        return generate_pattern_service(request.prompt)
    except Exception as e:
        logging.exception("Error generating pattern")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit")
def edit_region(request: RegionEditRequest):
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
            request.prompt
        )
    except Exception as e:
        logging.exception("Error editing region")
        raise HTTPException(status_code=500, detail=str(e))

