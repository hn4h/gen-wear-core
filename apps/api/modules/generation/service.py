import os
import uuid
import base64
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
    processed_base64 = resize_for_tier(base64_image, user.account_tier)
    
    # Apply watermark if FREE tier
    if user.account_tier == "FREE":
        processed_base64 = apply_watermark(processed_base64)

    # 4. Save to D drive (mounted at /app/uploads inside container)
    upload_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(upload_dir, filename)

    try:
        image_bytes = _get_image_bytes(processed_base64)
        with open(filepath, "wb") as f:
            f.write(image_bytes)

        # Build public URL
        api_base = os.getenv("API_BASE_URL", "https://api.genwear.io.vn")
        image_url = f"{api_base}/static/designs/{filename}"
        print(f"Saved design image: {filepath} → {image_url}")
    except Exception as save_err:
        # Fallback: nếu không lưu được file thì vẫn trả base64 để không crash
        print(f"Warning: could not save image to disk: {save_err}. Falling back to base64.")
        image_url = f"data:image/png;base64,{processed_base64}"
    
    # 5. Construct response
    # Returning url so frontend can use it directly in <img src="...">
    return {
        "url": image_url,
        "prompt": optimized_prompt
    }


def _get_image_bytes(base64_or_bytes) -> bytes:
    """Normalize whatever image_service returns into raw bytes."""
    if isinstance(base64_or_bytes, bytes):
        try:
            decoded_str = base64_or_bytes.decode("utf-8")
            if decoded_str.startswith("iVBOR") or decoded_str.startswith("/9j/"):
                return base64.b64decode(decoded_str)
        except UnicodeDecodeError:
            pass
        return base64_or_bytes
    # It's already a base64 string
    return base64.b64decode(base64_or_bytes)
