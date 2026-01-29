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
        # Standard base64 encoding (utf-8 string)
        base64_str = base64.b64encode(image_bytes).decode('utf-8')
        
        return base64_str

    except Exception as e:
        print(f"Error generating image with Imagen 4: {e}")
        raise e
