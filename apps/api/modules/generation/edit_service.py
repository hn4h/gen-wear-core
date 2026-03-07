import os
import base64
from google import genai
from google.genai import types
from .gemini_service import enhance_prompt
from .watermark_service import apply_watermark
from .resolution_service import resize_for_tier
from apps.api.modules.credits.service import deduct_credit
from apps.api.modules.auth.models import User
from sqlalchemy.orm import Session

def edit_region_service(image_base64: str, mask_base64: str, prompt: str, user: User, db: Session) -> dict:
    """
    Edit a region of the image based on the mask and prompt.
    
    Args:
        image_base64: Original image as base64 string (without data URI prefix)
        mask_base64: Mask image as base64 string (white = area to edit)
        prompt: Description of the edit to apply
    
    Returns:
        dict with 'url' containing the edited image as data URI
    """
    # 0. Check and deduct credit for editing
    deduct_credit(user, db, "EDIT", description="Chỉnh sửa vùng: " + prompt[:30])
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")

    try:
        # 1. Initialize Client
        client = genai.Client(api_key=api_key)
        
        # 2. Enhance the edit prompt
        enhanced_prompt = enhance_prompt(f"Edit the selected region to: {prompt}")
        print(f"Edit Original: [{prompt}]")
        print(f"Edit Enhanced: [{enhanced_prompt}]")
        
        # 3. Decode images from base64
        image_bytes = base64.b64decode(image_base64)
        mask_bytes = base64.b64decode(mask_base64)
        
        # 4. Use Imagen's image editing capabilities
        # Note: If Imagen edit is not available, we fall back to regenerating with context
        try:
            # Try using edit_image if available
            response = client.models.edit_image(
                model='imagen-4.0-generate-001',
                prompt=enhanced_prompt,
                image=types.RawReferenceImage(
                    reference_id=1,
                    reference_image=types.Image(image_bytes=image_bytes)
                ),
                mask=types.MaskReferenceImage(
                    reference_id=2,
                    config=types.MaskReferenceConfig(
                        mask_mode=types.MaskMode.MASK_MODE_USER_PROVIDED,
                        mask_dilation=0.03
                    ),
                    mask_image=types.Image(image_bytes=mask_bytes)
                ),
                config=types.EditImageConfig(
                    edit_mode=types.EditMode.EDIT_MODE_INPAINT_INSERTION,
                    number_of_images=1
                )
            )
            
            if not response.generated_images:
                raise ValueError("No images returned from edit.")
                
            # Get the edited image
            edited_bytes = response.generated_images[0].image.image_bytes
            
            if isinstance(edited_bytes, str):
                edited_base64 = edited_bytes
            elif isinstance(edited_bytes, bytes):
                try:
                    decoded_str = edited_bytes.decode('utf-8')
                    if decoded_str.startswith('iVBOR') or decoded_str.startswith('/9j/'):
                        edited_base64 = decoded_str
                    else:
                        edited_base64 = base64.b64encode(edited_bytes).decode('utf-8')
                except UnicodeDecodeError:
                    edited_base64 = base64.b64encode(edited_bytes).decode('utf-8')
            else:
                edited_base64 = base64.b64encode(edited_bytes).decode('utf-8')
            
            # Apply tier-specific processing (Resolution & Watermark)
            edited_base64 = resize_for_tier(edited_base64, user.account_tier)
            if user.account_tier == "FREE":
                edited_base64 = apply_watermark(edited_base64)
            
            return {
                "url": f"data:image/png;base64,{edited_base64}",
                "prompt": enhanced_prompt
            }
            
        except Exception as edit_error:
            print(f"Edit API not available or failed: {edit_error}")
            print("Falling back to regeneration with prompt context...")
            
            # Fallback: Generate a new image with context from the original
            # This is a simplified fallback - real implementation would be more sophisticated
            fallback_prompt = f"A bandana pattern design. {enhanced_prompt}. Style should match: seamless, tileable pattern suitable for fabric printing."
            
            response = client.models.generate_images(
                model='imagen-4.0-generate-001',
                prompt=fallback_prompt,
                config=types.GenerateImagesConfig(
                    aspect_ratio='1:1'
                )
            )
            
            if not response.generated_images:
                raise ValueError("No images returned from fallback generation.")
                
            generated_bytes = response.generated_images[0].image.image_bytes
            
            if isinstance(generated_bytes, str):
                generated_base64 = generated_bytes
            elif isinstance(generated_bytes, bytes):
                try:
                    decoded_str = generated_bytes.decode('utf-8')
                    if decoded_str.startswith('iVBOR') or decoded_str.startswith('/9j/'):
                        generated_base64 = decoded_str
                    else:
                        generated_base64 = base64.b64encode(generated_bytes).decode('utf-8')
                except UnicodeDecodeError:
                    generated_base64 = base64.b64encode(generated_bytes).decode('utf-8')
            else:
                generated_base64 = base64.b64encode(generated_bytes).decode('utf-8')
            
            # Apply tier-specific processing
            generated_base64 = resize_for_tier(generated_base64, user.account_tier)
            if user.account_tier == "FREE":
                generated_base64 = apply_watermark(generated_base64)
            
            return {
                "url": f"data:image/png;base64,{generated_base64}",
                "prompt": fallback_prompt,
                "note": "Used fallback generation (edit API not available)"
            }

    except Exception as e:
        print(f"Error in edit_region_service: {e}")
        raise e
