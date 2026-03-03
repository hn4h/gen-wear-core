from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from apps.api.modules.blog.models import BlogPost, BlogComment, BlogLike
from apps.api.modules.blog.schemas import BlogPostCreate, BlogPostUpdate
import math


def _serialize_post(post: BlogPost, current_user_id: str | None = None) -> dict:
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author_id": post.author_id,
        "author_name": post.author.full_name if post.author else "Unknown",
        "image_urls": post.image_urls or [],
        "tags": post.tags,
        "is_published": post.is_published,
        "like_count": len(post.likes),
        "comment_count": len(post.comments),
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def _serialize_comment(comment: BlogComment) -> dict:
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "author_id": comment.author_id,
        "author_name": comment.author.full_name if comment.author else "Unknown",
        "content": comment.content,
        "created_at": comment.created_at,
    }


# ─── Posts ───────────────────────────────────────────────────────────────────

def get_posts(db: Session, page: int = 1, page_size: int = 10, search: str | None = None):
    query = db.query(BlogPost).filter(BlogPost.is_published == True)
    if search:
        query = query.filter(BlogPost.title.ilike(f"%{search}%"))
    total = query.count()
    posts = query.order_by(BlogPost.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = math.ceil(total / page_size) if page_size > 0 else 1
    return {
        "posts": [_serialize_post(p) for p in posts],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(total_pages, 1),
    }


def get_post(db: Session, post_id: str, current_user_id: str | None = None):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    data = _serialize_post(post, current_user_id)
    data["comments"] = [_serialize_comment(c) for c in post.comments]
    data["is_liked"] = current_user_id in [like.user_id for like in post.likes] if current_user_id else False
    return data


def create_post(db: Session, author_id: str, data: BlogPostCreate):
    post = BlogPost(
        title=data.title,
        content=data.content,
        author_id=author_id,
        image_urls=data.image_urls or [],
        tags=data.tags,
        is_published=data.is_published if data.is_published is not None else True,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post)


def update_post(db: Session, post_id: str, author_id: str, role: str, data: BlogPostUpdate):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != author_id and role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")
    if data.title is not None:
        post.title = data.title
    if data.content is not None:
        post.content = data.content
    if data.image_urls is not None:
        post.image_urls = data.image_urls
    if data.tags is not None:
        post.tags = data.tags
    if data.is_published is not None:
        post.is_published = data.is_published
    db.commit()
    db.refresh(post)
    return _serialize_post(post)


def delete_post(db: Session, post_id: str, author_id: str, role: str):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != author_id and role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}


# ─── Comments ────────────────────────────────────────────────────────────────

def add_comment(db: Session, post_id: str, author_id: str, content: str):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment = BlogComment(post_id=post_id, author_id=author_id, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _serialize_comment(comment)


def delete_comment(db: Session, comment_id: str, author_id: str, role: str):
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != author_id and role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


# ─── Likes ───────────────────────────────────────────────────────────────────

def toggle_like(db: Session, post_id: str, user_id: str):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    existing = db.query(BlogLike).filter(
        BlogLike.post_id == post_id,
        BlogLike.user_id == user_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        like = BlogLike(post_id=post_id, user_id=user_id)
        db.add(like)
        db.commit()
        liked = True
    db.refresh(post)
    return {"liked": liked, "like_count": len(post.likes)}
