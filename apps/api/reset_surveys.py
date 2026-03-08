"""
Script để xóa và tạo lại fake survey data với phân bố tốt hơn
"""
import sys
import os
from datetime import datetime, timedelta
import random

sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from apps.api.modules.auth.models import User
from apps.api.modules.survey.models import SurveyResponse, Survey
import uuid

# Database connection từ container
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://genwear:password@db:5432/genwear_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Câu trả lời mẫu với trọng số (answer, weight)
QUESTION_1_OPTIONS = [
    ('Rất dễ sử dụng, mượt mà', 45),  # 45% - Rất tốt
    ('Khá dễ sử dụng', 35),  # 35% - Tốt
    ('Bình thường', 13),  # 13% - Trung bình
    ('Hơi khó thao tác ở một số bước', 5),  # 5% - Hơi kém
    ('Khó sử dụng / cần cải thiện nhiều', 2)  # 2% - Kém
]

QUESTION_2_OPTIONS = [
    ('Tôi sẵn sàng nâng cấp Pro để có thêm tính năng', 40),  # 40% - Muốn Pro
    ('Phiên bản Free đã đủ dùng với tôi', 35),  # 35% - Hài lòng với Free
    ('Tôi thấy ổn nhưng muốn thêm gói khác (ví dụ gói trung cấp)', 15),  # 15% - Muốn gói khác
    ('Tôi chưa hiểu rõ sự khác nhau giữa Free và Pro', 7),  # 7% - Chưa hiểu
    ('Ý kiến khác', 3)  # 3% - Khác
]

QUESTION_3_OPTIONS = [
    ('Rất ấn tượng và sáng tạo', 42),  # 42% - Xuất sắc
    ('Giao diện đẹp, dễ dùng', 38),  # 38% - Rất tốt
    ('Khá ổn', 15),  # 15% - Tốt
    ('Bình thường', 4),  # 4% - Trung bình
    ('Cần cải thiện thêm', 1)  # 1% - Kém
]

FEEDBACK_OPTIONS = [
    ('Tôi đã hài lòng, chưa cần cải thiện gì', 25),  # 25% - Hài lòng
    ('Nhiều mẫu / template hơn', 20),  # 20%
    ('Có thêm bộ sưu tập thiết kế sẵn (BST) theo chủ đề', 20),  # 20%
    ('Công cụ custom mạnh hơn', 15),  # 15%
    ('Giá tốt hơn / ưu đãi nhiều hơn', 12),  # 12%
    ('Thanh toán nhanh và đơn giản hơn', 8)  # 8%
]

# Phân bố rating tốt hơn
RATING_WEIGHTS = [
    (5, 45),  # 45% - Rất tốt
    (4, 35),  # 35% - Tốt
    (3, 15),  # 15% - Trung bình
    (2, 4),   # 4% - Kém
    (1, 1)    # 1% - Rất kém
]

def get_weighted_rating():
    ratings, weights = zip(*RATING_WEIGHTS)
    return random.choices(ratings, weights=weights)[0]

def get_weighted_answer(options_with_weights):
    """Lấy câu trả lời ngẫu nhiên theo trọng số"""
    options, weights = zip(*options_with_weights)
    return random.choices(options, weights=weights)[0]

def get_q4_answer_for_rating(rating):
    mapping = {
        5: 'Rất đẹp và sáng tạo',
        4: 'Đẹp, có tính nghệ thuật',
        3: 'Khá ổn, dùng được',
        2: 'Chưa thật sự nổi bật',
        1: 'Cần chỉnh sửa thêm để đúng ý hơn'
    }
    return mapping.get(rating, 'Khá ổn, dùng được')

def random_datetime_between(start_date, end_date):
    delta = end_date - start_date
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start_date + timedelta(seconds=random_seconds)

def main():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("🗑️  BƯỚC 1: XÓA TẤT CẢ SURVEY CŨ")
        print("=" * 70)
        deleted_count = db.query(SurveyResponse).delete()
        db.commit()
        print(f"✅ Đã xóa {deleted_count} survey responses cũ\n")
        
        print("=" * 70)
        print("🎯 BƯỚC 2: TẠO SURVEY MỚI VỚI PHÂN BỐ TỐT HƠN")
        print("=" * 70)
        print("📊 Phân bố rating:")
        print("   🌟🌟🌟🌟🌟 (5 sao): 45%")
        print("   🌟🌟🌟🌟   (4 sao): 35%")
        print("   🌟🌟🌟     (3 sao): 15%")
        print("   🌟🌟       (2 sao): 4%")
        print("   🌟         (1 sao): 1%")
        print()
        
        # Tạo survey template
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
        
        # Lấy users
        users = db.query(User).filter(User.role != 'ADMIN').all()
        
        if not users:
            print("❌ Không có user nào!")
            return
        
        print(f"👥 Tìm thấy {len(users)} users\n")
        
        # Thời gian
        start_date = datetime(2026, 2, 23, 0, 0, 0)
        end_date = datetime(2026, 3, 9, 23, 59, 59)
        
        num_surveys = 30
        surveys_created = 0
        rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        q1_counts = {}
        q2_counts = {}
        q3_counts = {}
        
        for i in range(num_surveys):
            user = random.choice(users)
            
            user_created = user.created_at
            if user_created > end_date:
                continue
            
            survey_start = max(user_created, start_date)
            survey_time = random_datetime_between(survey_start, end_date)
            
            # Random câu trả lời với phân bố tốt
            q1 = get_weighted_answer(QUESTION_1_OPTIONS)
            q2 = get_weighted_answer(QUESTION_2_OPTIONS)
            q3 = get_weighted_answer(QUESTION_3_OPTIONS)
            rating = get_weighted_rating()
            rating_counts[rating] += 1
            q1_counts[q1] = q1_counts.get(q1, 0) + 1
            q2_counts[q2] = q2_counts.get(q2, 0) + 1
            q3_counts[q3] = q3_counts.get(q3, 0) + 1
            q4 = get_q4_answer_for_rating(rating)
            feedback = get_weighted_answer(FEEDBACK_OPTIONS)
            
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
            
            stars = '⭐' * rating
            print(f"  [{surveys_created:2d}/{num_surveys}] {stars} - {user.full_name or user.phone_number}")
        
        db.commit()
        
        print()
        print("=" * 70)
        print("✅ HOÀN THÀNH!")
        print("=" * 70)
        print(f"📊 Đã tạo {surveys_created} survey responses mới")
        print()
        print("📈 Phân bố thực tế:")
        for r in range(5, 0, -1):
            stars = '⭐' * r
            count = rating_counts[r]
        
        # Thống kê câu trả lời
        print("\n" + "=" * 70)
        print("📋 PHÂN BỐ CÂU TRẢ LỜI")
        print("=" * 70)
        
        print("\n📝 Câu hỏi 1 - Trải nghiệm:")
        for answer in ['Rất dễ sử dụng, mượt mà', 'Khá dễ sử dụng', 'Bình thường', 
                       'Hơi khó thao tác ở một số bước', 'Khó sử dụng / cần cải thiện nhiều']:
            count = q1_counts.get(answer, 0)
            if count > 0:
                percent = (count / surveys_created * 100)
                bar = '█' * int(percent / 3)
                print(f"   {answer[:30]:30s}: {count:2d} ({percent:5.1f}%) {bar}")
        
        print("\n📝 Câu hỏi 2 - Free vs Pro:")
        for answer in ['Tôi sẵn sàng nâng cấp Pro để có thêm tính năng', 
                       'Phiên bản Free đã đủ dùng với tôi',
                       'Tôi thấy ổn nhưng muốn thêm gói khác (ví dụ gói trung cấp)',
                       'Tôi chưa hiểu rõ sự khác nhau giữa Free và Pro',
                       'Ý kiến khác']:
            count = q2_counts.get(answer, 0)
            if count > 0:
                percent = (count / surveys_created * 100)
                bar = '█' * int(percent / 3)
                print(f"   {answer[:30]:30s}: {count:2d} ({percent:5.1f}%) {bar}")
        
        print("\n📝 Câu hỏi 3 - Đánh giá website:")
        for answer in ['Rất ấn tượng và sáng tạo', 'Giao diện đẹp, dễ dùng', 
                       'Khá ổn', 'Bình thường', 'Cần cải thiện thêm']:
            count = q3_counts.get(answer, 0)
            if count > 0:
                percent = (count / surveys_created * 100)
                bar = '█' * int(percent / 3)
                print(f"   {answer[:30]:30s}: {count:2d} ({percent:5.1f}%) {bar}")
        
            percent = (count / surveys_created * 100) if surveys_created > 0 else 0
            bar = '█' * int(percent / 2)
            print(f"   {stars}: {count:2d} ({percent:5.1f}%) {bar}")
        
        avg = sum(r * c for r, c in rating_counts.items()) / surveys_created if surveys_created > 0 else 0
        print(f"\n⭐ Rating trung bình: {avg:.2f}/5.0")
        print("=" * 70)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ LỖI: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
