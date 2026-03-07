import base64
import io
import os
from PIL import Image, ImageDraw

# Path to watermark logo (PNG with transparency)
WATERMARK_LOGO_PATH = os.getenv(
    "WATERMARK_LOGO_PATH",
    os.path.join(os.path.dirname(__file__), "assets", "watermark_logo.png")
)

# Watermark settings
WATERMARK_OPACITY = 100  # 0-255, where 255 is fully opaque
WATERMARK_SCALE = 0.15   # Logo size relative to image width
WATERMARK_MARGIN = 20    # Pixels from edge


def apply_watermark(image_base64: str) -> str:
    """
    Apply semi-transparent watermark logo ở góc phải dưới.
    
    Args:
        image_base64: Base64 encoded image (without data URI prefix)
    
    Returns:
        Base64 encoded image with watermark
    """
    # Decode base64 to image
    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    
    # Try to load watermark logo
    if os.path.exists(WATERMARK_LOGO_PATH):
        watermark = Image.open(WATERMARK_LOGO_PATH).convert("RGBA")
    else:
        # Fallback: create a simple text watermark if logo file not found
        watermark = _create_text_watermark(image.width)
    
    # Scale watermark relative to image
    wm_width = int(image.width * WATERMARK_SCALE)
    wm_height = int(watermark.height * (wm_width / watermark.width))
    watermark = watermark.resize((wm_width, wm_height), Image.LANCZOS)
    
    # Adjust opacity
    watermark = _adjust_opacity(watermark, WATERMARK_OPACITY)
    
    # Position: bottom-right corner
    x = image.width - wm_width - WATERMARK_MARGIN
    y = image.height - wm_height - WATERMARK_MARGIN
    
    # Paste watermark onto image
    image.paste(watermark, (x, y), watermark)
    
    # Convert back to RGB (remove alpha) and encode to base64
    output_image = image.convert("RGB")
    buffer = io.BytesIO()
    output_image.save(buffer, format="PNG")
    buffer.seek(0)
    
    return base64.b64encode(buffer.read()).decode('utf-8')


def _adjust_opacity(image: Image.Image, opacity: int) -> Image.Image:
    """Adjust the opacity of an RGBA image"""
    r, g, b, a = image.split()
    a = a.point(lambda x: min(x, opacity))
    return Image.merge("RGBA", (r, g, b, a))


def _create_text_watermark(image_width: int) -> Image.Image:
    """
    Create a highly visible text-based watermark as fallback.
    """
    from PIL import ImageFont
    
    text = "GEN WEAR"
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except (OSError, ImportError):
        font = ImageFont.load_default()
        
    # Create a small dummy image to measure text
    dummy_img = Image.new("RGBA", (1, 1))
    draw = ImageDraw.Draw(dummy_img)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Create an image just big enough to hold the text with a semi-transparent background
    watermark_orig = Image.new("RGBA", (text_width + 40, text_height + 40), (0, 0, 0, 150))
    draw = ImageDraw.Draw(watermark_orig)
    
    # Draw white text
    draw.text((20, 20), text, fill=(255, 255, 255, 255), font=font)
    
    return watermark_orig
