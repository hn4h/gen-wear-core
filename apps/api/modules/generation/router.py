from fastapi import APIRouter
from .schemas import GenerateRequest
from .service import generate_pattern_service

router = APIRouter()

@router.post("/")
async def generate_pattern(request: GenerateRequest):
    return await generate_pattern_service(request.prompt)
