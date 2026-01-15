from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
import os

app = FastAPI(title="Gen Wear API")

# CORS Config
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Celery Config
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
celery_app = Celery("gen_wear", broker=redis_url, backend=redis_url)

from pydantic import BaseModel
import asyncio

class GenerateRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "Welcome to Gen Wear API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate")
async def generate_pattern(request: GenerateRequest):
    # Simulate AI processing time
    await asyncio.sleep(2)
    
    # Return a dummy image URL (picsum for reliability)
    return {
        "url": f"https://picsum.photos/seed/{request.prompt}/1024/1024",
        "prompt": request.prompt
    }
