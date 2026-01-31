from .gemini_service import enhance_prompt
from .image_service import generate_image

def generate_pattern_service(prompt: str):
    # 1. Enhance the prompt using Gemini 1.5 Flash
    optimized_prompt = enhance_prompt(prompt)
    print(f"Original: [{prompt}]")
    print(f"Optimized: [{optimized_prompt}]")
    
    # 2. Generate image using Imagen 3
    # generate_image returns a raw base64 string
    base64_image = generate_image(optimized_prompt)
    
    # 3. Construct response
    # Returning Data URI schema so frontend can use it directly in <img src="...">
    return {
        "url": f"data:image/png;base64,{base64_image}",
        "prompt": optimized_prompt
    }

