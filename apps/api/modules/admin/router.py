from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_admin_user
from apps.api.modules.auth.models import User
from apps.api.modules.auth.schemas import UserResponse
from apps.api.modules.survey.models import SurveyResponse
from apps.api.modules.survey.schemas import SurveyResponseDetail, SurveyListResponse
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import math

router = APIRouter()

class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(USER|ADMIN)$", description="Role must be USER or ADMIN")

class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List all users (Admin only)"""
    query = db.query(User)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(User.full_name.ilike(search_term) | User.phone_number.ilike(search_term))
    
    total = query.count()
    offset = (page - 1) * page_size
    users = query.offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return UserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Update user role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Delete a user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent deleting yourself
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()


# ─── Analytics / Stats Endpoint ────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(
    days: int = Query(30, ge=7, le=365, description="Number of days to include in charts (7/14/30/90/365)"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Comprehensive dashboard stats for admin (Admin only). Use ?days=7|14|30|90|365"""
    from apps.api.modules.orders.models import Order
    from apps.api.modules.products.models import Product
    from apps.api.modules.designs.models import SavedDesign
    from apps.api.modules.blog.models import BlogPost, BlogComment, BlogLike
    from apps.api.modules.generation.models import AIGenerationLog
    from apps.api.modules.survey.models import SurveyResponse

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start = now - timedelta(days=days - 1)
    period_7_days = now - timedelta(days=7)
    period_30_days = now - timedelta(days=30)

    # ── Users ──────────────
    total_users = db.query(func.count(User.id)).scalar() or 0
    new_users_today = db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar() or 0
    new_users_period = db.query(func.count(User.id)).filter(User.created_at >= period_start).scalar() or 0

    # ── Products ──────────────
    total_products = db.query(func.count(Product.id)).scalar() or 0

    # ── Orders ──────────────
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    orders_period = db.query(func.count(Order.id)).filter(Order.created_at >= period_start).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status.notin_(["CANCELLED"])
    ).scalar() or 0.0
    revenue_today = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= today_start,
        Order.status.notin_(["CANCELLED"])
    ).scalar() or 0.0
    revenue_period = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= period_start,
        Order.status.notin_(["CANCELLED"])
    ).scalar() or 0.0

    orders_by_status_rows = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    orders_by_status = {row[0]: row[1] for row in orders_by_status_rows}

    # ── AI Generations (from log, not saved designs) ──────────────
    total_ai_generations = db.query(func.count(AIGenerationLog.id)).scalar() or 0
    ai_today = db.query(func.count(AIGenerationLog.id)).filter(AIGenerationLog.created_at >= today_start).scalar() or 0
    ai_period = db.query(func.count(AIGenerationLog.id)).filter(AIGenerationLog.created_at >= period_start).scalar() or 0

    # ── Saved Designs (for context) ──────────────
    total_saved_designs = db.query(func.count(SavedDesign.id)).scalar() or 0

    # ── Blog ──────────────
    total_blog_posts = db.query(func.count(BlogPost.id)).scalar() or 0
    total_comments = db.query(func.count(BlogComment.id)).scalar() or 0
    total_likes = db.query(func.count(BlogLike.post_id)).scalar() or 0

    # ── Survey ──────────────
    total_survey_responses = db.query(func.count(SurveyResponse.id)).scalar() or 0
    survey_last_7_days = db.query(func.count(SurveyResponse.id)).filter(
        SurveyResponse.created_at >= period_7_days
    ).scalar() or 0
    survey_last_30_days = db.query(func.count(SurveyResponse.id)).filter(
        SurveyResponse.created_at >= period_30_days
    ).scalar() or 0
    avg_rating = db.query(func.avg(SurveyResponse.rating)).filter(
        SurveyResponse.rating.isnot(None)
    ).scalar()
    avg_rating = round(float(avg_rating), 2) if avg_rating else None

    # ── Time-series: grouped daily ──────────────
    def build_chart(rows, label_col='day', count_col='count'):
        return {str(getattr(r, label_col)): getattr(r, count_col) for r in rows}

    day_labels = [(period_start + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]

    user_rows = db.query(
        func.date(User.created_at).label('day'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= period_start).group_by(func.date(User.created_at)).all()
    user_chart = build_chart(user_rows)

    order_rows = db.query(
        func.date(Order.created_at).label('day'),
        func.count(Order.id).label('count'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        Order.created_at >= period_start,
        Order.status.notin_(['CANCELLED'])
    ).group_by(func.date(Order.created_at)).all()
    order_chart = {str(r.day): r.count for r in order_rows}
    revenue_chart = {str(r.day): float(r.revenue or 0) for r in order_rows}

    ai_rows = db.query(
        func.date(AIGenerationLog.created_at).label('day'),
        func.count(AIGenerationLog.id).label('count')
    ).filter(AIGenerationLog.created_at >= period_start).group_by(func.date(AIGenerationLog.created_at)).all()
    ai_chart = build_chart(ai_rows)

    blog_rows = db.query(
        func.date(BlogPost.created_at).label('day'),
        func.count(BlogPost.id).label('count')
    ).filter(BlogPost.created_at >= period_start).group_by(func.date(BlogPost.created_at)).all()
    blog_chart = build_chart(blog_rows)

    return {
        # Summary cards
        "total_users": total_users,
        "new_users_today": new_users_today,
        "new_users_period": new_users_period,
        "total_products": total_products,
        "total_orders": total_orders,
        "orders_period": orders_period,
        "total_revenue": round(total_revenue, 2),
        "revenue_today": round(revenue_today, 2),
        "revenue_period": round(revenue_period or 0, 2),
        "orders_by_status": orders_by_status,
        "total_ai_generations": total_ai_generations,
        "ai_generations_today": ai_today,
        "ai_period": ai_period,
        "total_saved_designs": total_saved_designs,
        "total_blog_posts": total_blog_posts,
        "total_comments": total_comments,
        "total_likes": total_likes,
        "total_survey_responses": total_survey_responses,
        "survey_last_7_days": survey_last_7_days,
        "survey_last_30_days": survey_last_30_days,
        "avg_survey_rating": avg_rating,
        # Chart time-series
        "chart_days": day_labels,
        "chart_new_users": [user_chart.get(d, 0) for d in day_labels],
        "chart_orders": [order_chart.get(d, 0) for d in day_labels],
        "chart_revenue": [revenue_chart.get(d, 0) for d in day_labels],
        "chart_ai_gens": [ai_chart.get(d, 0) for d in day_labels],
        "chart_blog_posts": [blog_chart.get(d, 0) for d in day_labels],
        # Meta
        "period_days": days,
    }


# ─── Survey Management Endpoints ────────────────────────────────────────────────

@router.get("/surveys", response_model=SurveyListResponse)
async def list_survey_responses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_rating: int = Query(None, ge=1, le=5),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List all survey responses with user details (Admin only)"""
    query = db.query(SurveyResponse).join(
        User, SurveyResponse.user_id == User.id, isouter=True
    )
    
    # Filter by rating if provided
    if min_rating:
        query = query.filter(SurveyResponse.rating >= min_rating)
    
    # Order by newest first
    query = query.order_by(SurveyResponse.created_at.desc())
    
    total = query.count()
    offset = (page - 1) * page_size
    responses = query.offset(offset).limit(page_size).all()
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    # Build response with user details
    response_list = []
    for resp in responses:
        user = db.query(User).filter(User.id == resp.user_id).first() if resp.user_id else None
        response_list.append(
            SurveyResponseDetail(
                id=resp.id,
                survey_id=resp.survey_id,
                user_id=resp.user_id,
                question_1_answer=resp.question_1_answer,
                question_2_answer=resp.question_2_answer,
                question_3_answer=resp.question_3_answer,
                rating=resp.rating,
                feedback=resp.feedback,
                created_at=resp.created_at,
                user_name=user.full_name if user else "Anonymous",
                user_phone=user.phone_number if user else None,
                user_email=None  # User model doesn't have email field
            )
        )
    
    return SurveyListResponse(
        responses=response_list,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.delete("/surveys/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_survey_response(
    response_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Delete a survey response (Admin only)"""
    response = db.query(SurveyResponse).filter(SurveyResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Survey response not found")
    
    db.delete(response)
    db.commit()


@router.get("/surveys/analytics")
async def get_survey_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Get detailed survey analytics for charts (Admin only)"""
    from collections import Counter
    
    # Define question titles
    QUESTION_TITLES = {
        'question_1': 'Trải nghiệm tổng thể từ thiết kế → thanh toán',
        'question_2': 'Phiên bản Free và Pro',
        'question_3': 'Đánh giá về website GenWear'
    }
    
    # Get all survey responses
    responses = db.query(SurveyResponse).all()
    total_responses = len(responses)
    
    if total_responses == 0:
        return {
            "total_responses": 0,
            "rating_distribution": {},
            "question_1_stats": {},
            "question_2_stats": {},
            "question_3_stats": {},
            "question_titles": QUESTION_TITLES,
            "avg_rating": 0,
            "responses_over_time": []
        }
    
    # Rating distribution
    ratings = [r.rating for r in responses if r.rating]
    rating_distribution = dict(Counter(ratings))
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # Question 1 statistics (count occurrences of each answer)
    q1_answers = [r.question_1_answer for r in responses if r.question_1_answer]
    q1_stats = dict(Counter(q1_answers))
    
    # Question 2 statistics
    q2_answers = [r.question_2_answer for r in responses if r.question_2_answer]
    q2_stats = dict(Counter(q2_answers))
    
    # Question 3 statistics
    q3_answers = [r.question_3_answer for r in responses if r.question_3_answer]
    q3_stats = dict(Counter(q3_answers))
    
    # Responses over time (last 30 days)
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    
    recent_responses = [r for r in responses if r.created_at >= last_30_days]
    
    # Group by date
    date_counts = {}
    for r in recent_responses:
        date_key = r.created_at.strftime('%Y-%m-%d')
        date_counts[date_key] = date_counts.get(date_key, 0) + 1
    
    # Fill in missing dates with 0
    responses_over_time = []
    for i in range(30):
        date = (now - timedelta(days=29-i)).strftime('%Y-%m-%d')
        responses_over_time.append({
            "date": date,
            "count": date_counts.get(date, 0)
        })
    
    return {
        "total_responses": total_responses,
        "rating_distribution": rating_distribution,
        "question_1_stats": q1_stats,
        "question_2_stats": q2_stats,
        "question_3_stats": q3_stats,
        "question_titles": QUESTION_TITLES,
        "avg_rating": round(avg_rating, 2),
        "responses_over_time": responses_over_time
    }
