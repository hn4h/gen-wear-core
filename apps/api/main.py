from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
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
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Gen Wear API", redirect_slashes=False)

# CORS Config - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for static file access in WebGL contexts
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Custom middleware to add additional CORS headers for static files  
class StaticFilesCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Ensure static files have proper CORS for WebGL/Canvas
        if request.url.path.startswith("/static/"):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        return response

# Add after CORSMiddleware (this runs first due to middleware order)
app.add_middleware(StaticFilesCORSMiddleware)

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

from apps.api.modules.cart.router import router as cart_router
from apps.api.modules.orders.router import router as orders_router
from apps.api.modules.credits.router import router as credits_router


app.include_router(credits_router, prefix="/api/credits", tags=["credits"])
from apps.api.modules.designs.router import router as designs_router

app.include_router(cart_router, prefix="/api/cart", tags=["cart"])
app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
app.include_router(designs_router, prefix="/api/designs", tags=["designs"])

from apps.api.modules.blog.router import router as blog_router
app.include_router(blog_router, prefix="/api/blog", tags=["blog"])

from apps.api.modules.payment.router import router as payment_router
app.include_router(payment_router, prefix="/api/payment", tags=["payment"])

from apps.api.modules.survey.router import router as survey_router
app.include_router(survey_router, prefix="/api/survey", tags=["survey"])

# Serve uploaded blog images as static files
_static_dir = os.path.join(os.path.dirname(__file__), "static", "blog-images")
os.makedirs(_static_dir, exist_ok=True)
app.mount("/static/blog-images", StaticFiles(directory=_static_dir), name="blog-images")

# Serve uploaded product images as static files
_products_static_dir = os.path.join(os.path.dirname(__file__), "static", "products-images")
os.makedirs(_products_static_dir, exist_ok=True)
app.mount("/static/products-images", StaticFiles(directory=_products_static_dir), name="products-images")

# Serve AI-generated design images from D drive (mounted at /app/uploads)
_uploads_dir = os.getenv("UPLOAD_DIR", "/app/uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/static/designs", StaticFiles(directory=_uploads_dir), name="designs")


from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation error: {exc.errors()}")
    try:
        body = await request.json()
        print(f"Request body: {body}")
    except:
        pass
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
