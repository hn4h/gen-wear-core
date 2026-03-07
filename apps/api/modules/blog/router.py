import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_user, get_optional_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.blog.schemas import (
    BlogPostCreate, BlogPostUpdate,
    BlogCommentCreate,
)
from apps.api.modules.blog import service

router = APIRouter()

# ─── Image Upload ─────────────────────────────────────────────────────────────

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "blog-images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Base URL for serving images – read from environment, fallback for local dev
_API_BASE = os.getenv("API_BASE_URL", "https://api.genwear.io.vn")


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload an image for a blog post. Returns the public URL."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP, or GIF allowed")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    dest_path = os.path.join(UPLOAD_DIR, filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"{_API_BASE}/static/blog-images/{filename}"
    return {"url": url}


# ─── Posts ────────────────────────────────────────────────────────────────────

@router.get("")
def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return service.get_posts(db, page=page, page_size=page_size, search=search)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_post(
    data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.create_post(db, author_id=current_user.id, data=data)


@router.get("/{post_id}")
def get_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    return service.get_post(db, post_id=post_id, current_user_id=user_id)


@router.put("/{post_id}")
def update_post(
    post_id: str,
    data: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.update_post(db, post_id=post_id, author_id=current_user.id, role=current_user.role, data=data)


@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.delete_post(db, post_id=post_id, author_id=current_user.id, role=current_user.role)


# ─── Comments ─────────────────────────────────────────────────────────────────

@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: str,
    data: BlogCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.add_comment(db, post_id=post_id, author_id=current_user.id, content=data.content)


@router.delete("/{post_id}/comments/{comment_id}", status_code=status.HTTP_200_OK)
def delete_comment(
    post_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.delete_comment(db, comment_id=comment_id, author_id=current_user.id, role=current_user.role)


# ─── Likes ────────────────────────────────────────────────────────────────────

@router.post("/{post_id}/like", status_code=status.HTTP_200_OK)
def toggle_like(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.toggle_like(db, post_id=post_id, user_id=current_user.id)
