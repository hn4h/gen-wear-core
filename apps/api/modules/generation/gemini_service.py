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
        
        sys_instruct = "You are an expert AI Art Prompt Engineer. Convert user description into a detailed Stable Diffusion prompt. Return ONLY the prompt."
        
        response = client.models.generate_content(
            model="gemini-1.5-flash",
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
