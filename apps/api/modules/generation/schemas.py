from pydantic import BaseModel
from typing import Optional

class GenerateRequest(BaseModel):
    prompt: str

class RegionEditRequest(BaseModel):
    image_base64: str  # Original image as base64 (without data URI prefix)
    mask_base64: str   # Mask image as base64 (white = edit area)
    prompt: str        # Edit description

