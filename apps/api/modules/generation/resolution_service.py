import base64
import io
from PIL import Image

# Resolution presets
RESOLUTION_PRESETS = {
    "1K": 1024,
    "2K": 2048,
    "4K": 4096
}

# Tier resolution limits
TIER_MAX_RESOLUTION = {
    "FREE": "1K",
    "PRO": "4K"
}


def resize_for_tier(image_base64: str, account_tier: str, target_resolution: str = None) -> str:
    """
    Resize ảnh theo tier của user.
    
    - FREE: luôn resize xuống 1K (1024px)
    - PRO: giữ nguyên hoặc resize theo target_resolution (2K/4K)
    
    Args:
        image_base64: Base64 encoded image (without data URI prefix)
        account_tier: "FREE" or "PRO"
        target_resolution: Optional - "1K", "2K", "4K". Default follows tier.
    
    Returns:
        Base64 encoded resized image
    """
    # Determine max resolution for tier
    max_res_key = TIER_MAX_RESOLUTION.get(account_tier, "1K")
    max_res = RESOLUTION_PRESETS.get(max_res_key, 1024)
    
    # If target specified, cap it at tier max
    if target_resolution:
        target_res = RESOLUTION_PRESETS.get(target_resolution, max_res)
        target_res = min(target_res, max_res)
    else:
        # Default: FREE gets 1K, PRO gets original (no resize unless > 4K)
        if account_tier == "FREE":
            target_res = RESOLUTION_PRESETS["1K"]
        else:
            target_res = max_res
    
    # Decode image
    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Check if resize needed
    current_max = max(image.width, image.height)
    if current_max <= target_res:
        # Image is already within limits, return as-is
        return image_base64
    
    # Calculate new dimensions maintaining aspect ratio
    ratio = target_res / current_max
    new_width = int(image.width * ratio)
    new_height = int(image.height * ratio)
    
    # Resize with high quality
    resized = image.resize((new_width, new_height), Image.LANCZOS)
    
    # Encode back to base64
    buffer = io.BytesIO()
    resized.save(buffer, format="PNG")
    buffer.seek(0)
    
    return base64.b64encode(buffer.read()).decode('utf-8')


def get_available_resolutions(account_tier: str) -> list:
    """Get list of available resolutions for a tier"""
    if account_tier == "PRO":
        return ["1K", "2K", "4K"]
    return ["1K"]
