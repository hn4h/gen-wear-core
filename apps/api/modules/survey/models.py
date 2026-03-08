from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from apps.api.modules.auth.database import Base
from datetime import datetime
import uuid


class Survey(Base):
    """
    Bảng lưu các survey template (do admin tạo).
    Mỗi survey có title, description, và các câu hỏi.
    """
    __tablename__ = "surveys"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)  # Tiêu đề khảo sát
    description = Column(Text, nullable=True)  # Mô tả khảo sát
    is_active = Column(Boolean, default=True)  # Có đang hiển thị cho user không
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    responses = relationship("SurveyResponse", back_populates="survey", cascade="all, delete-orphan")


class SurveyResponse(Base):
    """
    Bảng lưu câu trả lời của user cho survey.
    Mỗi user có thể submit nhiều lần nếu muốn.
    """
    __tablename__ = "survey_responses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_id = Column(String, ForeignKey("surveys.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # NULL nếu anonymous
    
    # Response data (JSON string hoặc text tự do)
    question_1_answer = Column(Text, nullable=True)  # "Bạn thích tính năng nào nhất?"
    question_2_answer = Column(Text, nullable=True)  # "Bạn muốn cải thiện gì?"
    question_3_answer = Column(Text, nullable=True)  # "Đánh giá chất lượng AI"
    rating = Column(Integer, nullable=True)  # Rating 1-5 stars
    feedback = Column(Text, nullable=True)  # Feedback chung
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    survey = relationship("Survey", back_populates="responses")
    # Note: User relationship removed to avoid circular import issues
    # The admin router manually queries User separately when needed
