import asyncio
from .gemini_service import enhance_prompt

async def generate_pattern_service(prompt: str):
    # Call Gemini to enhance the prompt
    optimized_prompt = enhance_prompt(prompt)
    
    # Log the prompt enhancement
    print(f"Original: [{prompt}]")
    print(f"Optimized: [{optimized_prompt}]")

    # Simulate AI processing time
    await asyncio.sleep(2)
    
    # Return a dummy image URL (picsum for reliability)
    # Using the optimized prompt for the response to show it on frontend
    return {
        "url": f"https://picsum.photos/seed/{prompt}/1024/1024",
        "prompt": optimized_prompt
    }
