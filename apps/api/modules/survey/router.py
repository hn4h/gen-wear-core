from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_optional_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.survey.models import SurveyResponse
from apps.api.modules.survey.schemas import SurveyResponseCreate

router = APIRouter()


@router.post("/submit")
def submit_survey(
    response: SurveyResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    """
    User submit survey response.
    Có thể anonymous (current_user = None) hoặc authenticated.
    """
    survey_response = SurveyResponse(
        survey_id=response.survey_id,
        user_id=current_user.id if current_user else None,
        question_1_answer=response.question_1_answer,
        question_2_answer=response.question_2_answer,
        question_3_answer=response.question_3_answer,
        rating=response.rating,
        feedback=response.feedback
    )
    
    db.add(survey_response)
    db.commit()
    db.refresh(survey_response)
    
    return {
        "success": True,
        "message": "Cảm ơn bạn đã hoàn thành khảo sát!",
        "response_id": survey_response.id
    }
