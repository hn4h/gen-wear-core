import os
import uuid
import base64
from .gemini_service import enhance_prompt
from .image_service import generate_image


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


def generate_pattern_service(prompt: str):
    # 1. Enhance the prompt using Gemini Flash
    optimized_prompt = enhance_prompt(prompt)
    print(f"Original: [{prompt}]")
    print(f"Optimized: [{optimized_prompt}]")

    # 2. Generate image using Imagen and get raw base64
    base64_image = generate_image(optimized_prompt)

    # 3. Save to D drive (mounted at /app/uploads inside container)
    upload_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(upload_dir, filename)

    try:
        image_bytes = _get_image_bytes(base64_image)
        with open(filepath, "wb") as f:
            f.write(image_bytes)

        # Build public URL
        api_base = os.getenv("API_BASE_URL", "http://localhost:8000")
        image_url = f"{api_base}/static/designs/{filename}"
        print(f"Saved design image: {filepath} → {image_url}")
    except Exception as save_err:
        # Fallback: nếu không lưu được file thì vẫn trả base64 để không crash
        print(f"Warning: could not save image to disk: {save_err}. Falling back to base64.")
        image_url = f"data:image/png;base64,{base64_image}"

    # 4. Return public URL (or base64 fallback)
    return {
        "url": image_url,
        "prompt": optimized_prompt
    }
