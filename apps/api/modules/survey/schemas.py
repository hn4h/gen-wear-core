from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SurveyResponseCreate(BaseModel):
    """Schema để user submit survey response"""
    survey_id: str
    question_1_answer: Optional[str] = None
    question_2_answer: Optional[str] = None
    question_3_answer: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None


class SurveyResponseDetail(BaseModel):
    """Schema để trả về chi tiết một survey response"""
    id: str
    survey_id: str
    user_id: Optional[str]
    question_1_answer: Optional[str]
    question_2_answer: Optional[str]
    question_3_answer: Optional[str]
    rating: Optional[int]
    feedback: Optional[str]
    created_at: datetime
    
    # Thêm thông tin user (nếu có)
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    user_email: Optional[str] = None
    
    class Config:
        from_attributes = True


class SurveyListResponse(BaseModel):
    """Schema để list survey responses với pagination"""
    responses: list[SurveyResponseDetail]
    total: int
    page: int
    page_size: int
    total_pages: int


class SurveyStats(BaseModel):
    """Schema cho thống kê survey trong dashboard"""
    total_responses: int
    avg_rating: Optional[float]
    response_last_7_days: int
    response_last_30_days: int
