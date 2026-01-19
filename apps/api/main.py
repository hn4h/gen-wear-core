from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
import os
from apps.api.modules.generation.router import router as generation_router

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Gen Wear API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(generation_router, prefix="/api/generation", tags=["generation"])
