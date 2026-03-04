from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ─── Comment Schemas ────────────────────────────────────────────────────────

class BlogCommentCreate(BaseModel):
    content: str


class BlogCommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Blog Post Schemas ───────────────────────────────────────────────────────

class BlogPostCreate(BaseModel):
    title: str
    content: str
    image_urls: Optional[List[str]] = []
    tags: Optional[str] = None
    is_published: Optional[bool] = True


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_urls: Optional[List[str]] = None
    tags: Optional[str] = None
    is_published: Optional[bool] = None


class BlogPostSummary(BaseModel):
    """Lightweight schema for list view (no comments)"""
    id: str
    title: str
    content: str
    author_id: str
    author_name: str
    image_urls: List[str]
    tags: Optional[str]
    is_published: bool
    like_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostResponse(BlogPostSummary):
    """Full detail schema with comments"""
    comments: List[BlogCommentResponse] = []
    is_liked: bool = False


class BlogPostListResponse(BaseModel):
    posts: List[BlogPostSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
