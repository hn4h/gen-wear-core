from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from celery import Celery
import os
from apps.api.modules.generation.router import router as generation_router
from apps.api.modules.auth.router import router as auth_router
from apps.api.modules.products.router import router as product_router
from apps.api.modules.products.router import (
    category_router, collection_router, tag_router
)
from apps.api.modules.admin.router import router as admin_router
from apps.api.modules.auth.database import init_db

app = FastAPI(title="Gen Wear API")

# CORS Config
# origins = [
#     "http://localhost:3000",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Celery Config
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
celery_app = Celery("gen_wear", broker=redis_url, backend=redis_url)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to Gen Wear API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(generation_router, prefix="/api/generation", tags=["generation"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(product_router, prefix="/api/products", tags=["products"])
app.include_router(category_router, prefix="/api/categories", tags=["categories"])
app.include_router(collection_router, prefix="/api/collections", tags=["collections"])
app.include_router(tag_router, prefix="/api/tags", tags=["tags"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

