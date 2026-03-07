import os
import uuid
import base64
from google import genai
from google.genai import types
from .gemini_service import enhance_prompt


def _bytes_to_png(image_bytes: bytes, upload_dir: str) -> str:
    """Save image bytes to a PNG file and return the public URL."""
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    api_base = os.getenv("API_BASE_URL", "http://localhost:8000")
    return f"{api_base}/static/designs/{filename}"


def edit_region_service(image_base64: str, mask_base64: str, prompt: str) -> dict:
    """
    Edit a region of the image based on the mask and prompt.

    Args:
        image_base64: Original image as base64 string (without data URI prefix)
        mask_base64:  Mask image as base64 string (white = area to edit)
        prompt:       Description of the edit to apply

    Returns:
        dict with 'url' pointing to the saved PNG file
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")

    upload_dir = os.getenv("UPLOAD_DIR", "/app/uploads")

    try:
        client = genai.Client(api_key=api_key)

        enhanced_prompt = enhance_prompt(f"Edit the selected region to: {prompt}")
        print(f"Edit Original: [{prompt}]")
        print(f"Edit Enhanced: [{enhanced_prompt}]")

        image_bytes = base64.b64decode(image_base64)
        mask_bytes = base64.b64decode(mask_base64)

        try:
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

            edited_bytes = response.generated_images[0].image.image_bytes
            image_url = _bytes_to_png(edited_bytes, upload_dir)

            return {"url": image_url, "prompt": enhanced_prompt}

        except Exception as edit_error:
            print(f"Edit API not available or failed: {edit_error}")
            print("Falling back to regeneration with prompt context...")

            fallback_prompt = (
                f"A bandana pattern design. {enhanced_prompt}. "
                "Style should match: seamless, tileable pattern suitable for fabric printing."
            )
            response = client.models.generate_images(
                model='imagen-4.0-generate-001',
                prompt=fallback_prompt,
                config=types.GenerateImagesConfig(aspect_ratio='1:1')
            )

            if not response.generated_images:
                raise ValueError("No images returned from fallback generation.")

            generated_bytes = response.generated_images[0].image.image_bytes
            image_url = _bytes_to_png(generated_bytes, upload_dir)

            return {
                "url": image_url,
                "prompt": fallback_prompt,
                "note": "Used fallback generation (edit API not available)"
            }

    except Exception as e:
        print(f"Error in edit_region_service: {e}")
        raise e
