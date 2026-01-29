from fastapi import APIRouter
from .schemas import GenerateRequest
from .service import generate_pattern_service

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
