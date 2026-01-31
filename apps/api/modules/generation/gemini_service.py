import os
from google import genai
from google.genai import types

def enhance_prompt(user_input: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found.")
        return user_input

    try:
        # Khởi tạo Client theo chuẩn mới
        client = genai.Client(api_key=api_key)
        
        sys_instruct = """You are an expert textile and bandana design prompt engineer.

TASK:
Transform the user's idea into a single, precise English prompt for AI image generation.

PRODUCT CONSTRAINTS:
- Product type: bandana (square fabric scarf)
- Flat 2D textile design, no 3D objects
- Seamless or repeatable pattern
- Centered and well-balanced composition
- High contrast, clear shapes
- Suitable for fabric printing

STYLE CONSTRAINTS:
- No text, no letters, no numbers
- No logos, no watermarks
- No photo-realism
- No people, no animals unless explicitly requested
- Clean vector-like illustration style

OUTPUT RULES:
- Return ONLY the final enhanced prompt
- Do NOT include explanations, notes, or formatting
- Do NOT mention any AI model names
"""
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_input,
            config=types.GenerateContentConfig(
                system_instruction=sys_instruct,
                temperature=0.7
            )
        )
        
        # Lấy text kết quả
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return user_input
