import os
import base64
from google import genai
from google.genai import types

def generate_image(prompt: str) -> str:
    """
    Generates an image using Google Imagen 4 via the official google-genai SDK.
    Returns the URL-safe Base64 string of the generated image.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")

    try:
        # 1. Initialize Client
        client = genai.Client(api_key=api_key)

        # 2. Call Imagen 3 Model
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                aspect_ratio='1:1'  # Square aspect ratio for Bandana
            )
        )

        # 3. Process Response
        if not response.generated_images:
            raise ValueError("No images returned from Imagen 4.")

        # Get raw bytes from the first image
        image_bytes = response.generated_images[0].image.image_bytes

        # 4. Convert to Base64 String
        # Check if image_bytes is already a base64 string (sometimes API returns string)
        if isinstance(image_bytes, str):
            # Already a string, might be base64 - return as-is
            return image_bytes
        elif isinstance(image_bytes, bytes):
            # Check if it's already base64 encoded bytes (starts with typical b64 chars)
            try:
                # Try to decode as UTF-8 string first
                decoded_str = image_bytes.decode('utf-8')
                # If it decodes to a string and looks like base64, return it
                if decoded_str.startswith('iVBOR') or decoded_str.startswith('/9j/'):
                    return decoded_str
            except UnicodeDecodeError:
                pass
            
            # Raw image bytes - need to encode to base64
            base64_str = base64.b64encode(image_bytes).decode('utf-8')
            return base64_str
        else:
            raise ValueError(f"Unexpected image_bytes type: {type(image_bytes)}")

    except Exception as e:
        print(f"Error generating image with Imagen 4: {e}")
        raise e
