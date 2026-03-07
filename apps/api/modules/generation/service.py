from .gemini_service import enhance_prompt
from .image_service import generate_image
from .watermark_service import apply_watermark
from .resolution_service import resize_for_tier
from apps.api.modules.credits.service import deduct_credit
from apps.api.modules.auth.models import User
from sqlalchemy.orm import Session

def generate_pattern_service(prompt: str, user: User, db: Session):
    # 0. Check and deduct credits for generation
    deduct_credit(user, db, "GENERATE", description="Tạo pattern mới: " + prompt[:30])
    
    # 1. Enhance the prompt using Gemini 1.5 Flash
    optimized_prompt = enhance_prompt(prompt)
    print(f"Original: [{prompt}]")
    print(f"Optimized: [{optimized_prompt}]")
    
    # 2. Generate image using Imagen 4
    # generate_image returns a raw base64 string
    base64_image = generate_image(optimized_prompt)
    
    # 3. Apply tier-specific processing (Resolution & Watermark)
    # Resize to 1K for Free, keep original (up to 4K) for Pro
    base64_image = resize_for_tier(base64_image, user.account_tier)
    
    # Apply watermark if FREE tier
    if user.account_tier == "FREE":
        base64_image = apply_watermark(base64_image)
    
    # 4. Construct response
    # Returning Data URI schema so frontend can use it directly in <img src="...">
    return {
        "url": f"data:image/png;base64,{base64_image}",
        "prompt": optimized_prompt
    }

