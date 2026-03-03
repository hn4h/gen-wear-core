from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_urls = Column(JSON, default=list)   # list of image URL strings
    tags = Column(String, nullable=True)       # comma-separated tags
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", foreign_keys=[author_id])
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BlogPost {self.title}>"


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    post_id = Column(String, ForeignKey("blog_posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    post = relationship("BlogPost", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])

    def __repr__(self):
        return f"<BlogComment by {self.author_id}>"


class BlogLike(Base):
    __tablename__ = "blog_likes"

    post_id = Column(String, ForeignKey("blog_posts.id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    post = relationship("BlogPost", back_populates="likes")

    def __repr__(self):
        return f"<BlogLike post={self.post_id} user={self.user_id}>"
