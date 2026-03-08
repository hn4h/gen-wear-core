"""
Script để tạo fake survey data cho GenWear
Tạo khoảng 25 survey responses từ 23/2/2026 đến 9/3/2026
"""
import sys
import os
import random
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from apps.api.modules.auth.models import User
from apps.api.modules.survey.models import SurveyResponse, Survey
import uuid

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://genwear:password@localhost:5432/genwear_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Câu trả lời mẫu từ PostGenerationSurvey.tsx
# Q1: Trải nghiệm tổng thể từ thiết kế → thanh toán
QUESTION_1_OPTIONS = [
    'Rất dễ sử dụng, mượt mà',
    'Khá dễ sử dụng',
    'Bình thường',
    'Hơi khó thao tác ở một số bước',
    'Khó sử dụng / cần cải thiện nhiều'
]

# Q2: Phiên bản Free và Pro
QUESTION_2_OPTIONS = [
    'Phiên bản Free đã đủ dùng với tôi',
    'Tôi sẵn sàng nâng cấp Pro để có thêm tính năng',
    'Tôi thấy ổn nhưng muốn thêm gói khác (ví dụ gói trung cấp)',
    'Tôi chưa hiểu rõ sự khác nhau giữa Free và Pro',
    'Ý kiến khác'
]

# Q3: Đánh giá về website GenWear
QUESTION_3_OPTIONS = [
    'Rất ấn tượng và sáng tạo',
    'Giao diện đẹp, dễ dùng',
    'Khá ổn',
    'Bình thường',
    'Cần cải thiện thêm'
]

# Q4: Mức độ hài lòng với thiết kế đã tạo (mapping to rating)
QUESTION_4_OPTIONS = [
    'Rất đẹp và sáng tạo',        # Rating 5
    'Đẹp, có tính nghệ thuật',    # Rating 4
    'Khá ổn, dùng được',          # Rating 3
    'Chưa thật sự nổi bật',       # Rating 2
    'Cần chỉnh sửa thêm để đúng ý hơn'  # Rating 1
]

# Q5: Nếu GenWear có thể cải thiện thêm (feedback)
FEEDBACK_OPTIONS = [
    'Nhiều mẫu / template hơn',
    'Có thêm bộ sưu tập thiết kế sẵn (BST) theo chủ đề',
    'Công cụ custom mạnh hơn',
    'Giá tốt hơn / ưu đãi nhiều hơn',
    'Thanh toán nhanh và đơn giản hơn',
    'Tôi đã hài lòng, chưa cần cải thiện gì'
]

# Rating distribution (weighted) - tương ứng với Q4
RATING_WEIGHTS = [
    (5, 28),  # 28% cho 5 sao (Rất đẹp và sáng tạo)
    (4, 36),  # 36% cho 4 sao (Đẹp, có tính nghệ thuật)
    (3, 20),  # 20% cho 3 sao (Khá ổn, dùng được)
    (2, 12),  # 12% cho 2 sao (Chưa thật sự nổi bật)
    (1, 4)    # 4% cho 1 sao (Cần chỉnh sửa thêm)
]

def get_weighted_rating():
    """Lấy rating ngẫu nhiên theo trọng số"""
    ratings, weights = zip(*RATING_WEIGHTS)
    return random.choices(ratings, weights=weights)[0]

def get_q4_answer_for_rating(rating):
    """Map rating → câu trả lời Q4 (mức độ hài lòng với thiết kế)"""
    mapping = {
        5: 'Rất đẹp và sáng tạo',
        4: 'Đẹp, có tính nghệ thuật',
        3: 'Khá ổn, dùng được',
        2: 'Chưa thật sự nổi bật',
        1: 'Cần chỉnh sửa thêm để đúng ý hơn'
    }
    return mapping.get(rating, QUESTION_4_OPTIONS[2])

def random_datetime_between(start_date, end_date):
    """Tạo datetime ngẫu nhiên giữa 2 ngày"""
    delta = end_date - start_date
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start_date + timedelta(seconds=random_seconds)

def create_fake_surveys():
    db = SessionLocal()
    
    try:
        # Tạo survey template nếu chưa có
        existing_survey = db.query(Survey).filter(Survey.id == 'general-feedback').first()
        if not existing_survey:
            survey_template = Survey(
                id='general-feedback',
                title='Khảo sát trải nghiệm GenWear',
                description='Khảo sát về trải nghiệm sử dụng website GenWear',
                is_active=True
            )
            db.add(survey_template)
            db.commit()
            print("✅ Đã tạo survey template 'general-feedback'")
        
        # Lấy tất cả users (trừ admin)
        users = db.query(User).filter(User.role != 'ADMIN').all()
        
        if not users:
            print("Không có user nào để tạo survey!")
            return
        
        print(f"Tìm thấy {len(users)} users (không bao gồm admin)")
        
        # Thời gian bắt đầu và kết thúc
        start_date = datetime(2026, 2, 23, 0, 0, 0)
        end_date = datetime(2026, 3, 9, 23, 59, 59)
        
        # Tạo 25 survey responses
        num_surveys = 25
        surveys_created = 0
        
        for i in range(num_surveys):
            # Random user
            user = random.choice(users)
            
            # Survey time phải sau ngày user đăng ký
            user_created = user.created_at
            if user_created > end_date:
                # Nếu user đăng ký sau end_date, skip
                continue
            
            # Thời gian survey phải sau ngày user đăng ký
            survey_start = max(user_created, start_date)
            
            # Random thời gian trong khoảng hợp lệ
            survey_time = random_datetime_between(survey_start, end_date)
            
            # Random câu trả lời
            q1 = random.choice(QUESTION_1_OPTIONS)
            q2 = random.choice(QUESTION_2_OPTIONS)
            q3 = random.choice(QUESTION_3_OPTIONS)
            rating = get_weighted_rating()
            q4 = get_q4_answer_for_rating(rating)  # Q4 phải match với rating
            feedback = random.choice(FEEDBACK_OPTIONS)
            
            # Tạo survey response
            survey = SurveyResponse(
                id=str(uuid.uuid4()),
                survey_id='general-feedback',
                user_id=user.id,
                question_1_answer=q1,
                question_2_answer=q2,
                question_3_answer=q3,
                rating=rating,
                feedback=feedback,
                created_at=survey_time
            )
            
            db.add(survey)
            surveys_created += 1
            
            print(f"Created survey {surveys_created}/{num_surveys}: User {user.full_name or user.phone_number} - Rating: {rating} - Time: {survey_time.strftime('%Y-%m-%d %H:%M')}")
        
        # Commit tất cả
        db.commit()
        print(f"\n✅ Đã tạo thành công {surveys_created} survey responses!")
        
        # Thống kê
        print("\n📊 Thống kê:")
        print(f"   - Từ ngày: {start_date.strftime('%d/%m/%Y')}")
        print(f"   - Đến ngày: {end_date.strftime('%d/%m/%Y')}")
        
        # Đếm theo rating
        rating_counts = {}
        for r in range(1, 6):
            count = db.query(SurveyResponse).filter(SurveyResponse.rating == r).count()
            rating_counts[r] = count
        
        print(f"\n   Phân bố rating:")
        for r in range(5, 0, -1):
            stars = '⭐' * r
            print(f"   {stars}: {rating_counts.get(r, 0)} khảo sát")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Bắt đầu tạo fake survey data...")
    print("=" * 60)
    create_fake_surveys()
    print("=" * 60)
    print("✨ Hoàn thành!")
