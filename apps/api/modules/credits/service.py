from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from apps.api.modules.auth.models import User
from apps.api.modules.credits.models import CreditPackage, CreditTransaction
from zoneinfo import ZoneInfo

# Vietnam timezone
VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

# Constants
FREE_DAILY_CREDITS = 5
PRO_CREDITS_PER_PACKAGE = 20
PRO_PACKAGE_PRICE = 100000  # 100k VNĐ
PRO_PACKAGE_EXPIRY_DAYS = 30


def get_vn_now() -> datetime:
    """Get current time in Vietnam timezone"""
    return datetime.now(VN_TZ)


def get_credit_balance(user: User, db: Session) -> dict:
    """
    Lấy tổng số credits khả dụng cho user.
    - Free: daily_credits_remaining (reset mỗi ngày)
    - Pro: tổng credits_remaining từ các CreditPackage chưa hết hạn + daily credits
    """
    # Reset daily credits if needed
    _reset_daily_credits_if_needed(user, db)
    
    daily_credits = user.daily_credits_remaining
    
    # Pro credits from active packages
    pro_credits = 0
    if user.account_tier == "PRO":
        now = datetime.utcnow()
        active_packages = db.query(CreditPackage).filter(
            and_(
                CreditPackage.user_id == user.id,
                CreditPackage.is_active == True,
                CreditPackage.expires_at > now,
                CreditPackage.credits_remaining > 0
            )
        ).order_by(CreditPackage.expires_at.asc()).all()
        
        pro_credits = sum(pkg.credits_remaining for pkg in active_packages)
    
    return {
        "daily_credits_remaining": daily_credits,
        "pro_credits_remaining": pro_credits,
        "total_available": daily_credits + pro_credits,
        "account_tier": user.account_tier,
        "daily_reset_at": user.daily_credits_reset_at.isoformat() if user.daily_credits_reset_at else None
    }


def check_credits(user: User, db: Session) -> bool:
    """Kiểm tra user còn credits không"""
    balance = get_credit_balance(user, db)
    return balance["total_available"] > 0


def deduct_credit(user: User, db: Session, transaction_type: str, description: str = None):
    """
    Trừ 1 credit từ user.
    Ưu tiên: daily credits trước → rồi mới đến pro credits (gói sắp hết hạn trước).
    Raises HTTPException nếu hết credits.
    """
    # Reset daily credits if needed
    _reset_daily_credits_if_needed(user, db)
    
    if not check_credits(user, db):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Bạn đã hết credits. Vui lòng mua thêm hoặc chờ reset ngày mới."
        )
    
    package_id = None
    
    # Try daily credits first
    if user.daily_credits_remaining > 0:
        user.daily_credits_remaining -= 1
    else:
        # Use pro credits (oldest expiring package first)
        now = datetime.utcnow()
        package = db.query(CreditPackage).filter(
            and_(
                CreditPackage.user_id == user.id,
                CreditPackage.is_active == True,
                CreditPackage.expires_at > now,
                CreditPackage.credits_remaining > 0
            )
        ).order_by(CreditPackage.expires_at.asc()).first()
        
        if package:
            package.credits_remaining -= 1
            package_id = package.id
            if package.credits_remaining == 0:
                package.is_active = False
        else:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Bạn đã hết credits."
            )
    
    # Log transaction
    transaction = CreditTransaction(
        user_id=user.id,
        amount=-1,
        transaction_type=transaction_type,
        description=description or f"Used 1 credit for {transaction_type.lower()}",
        package_id=package_id
    )
    db.add(transaction)
    db.commit()


def purchase_credits(user: User, db: Session, payos_order_id: str) -> CreditPackage:
    """
    Tạo gói credits Pro sau khi thanh toán thành công.
    Tự động nâng cấp user lên PRO nếu chưa phải.
    """
    now = datetime.utcnow()
    expires_at = now + timedelta(days=PRO_PACKAGE_EXPIRY_DAYS)
    
    # Create package
    package = CreditPackage(
        user_id=user.id,
        credits_total=PRO_CREDITS_PER_PACKAGE,
        credits_remaining=PRO_CREDITS_PER_PACKAGE,
        amount_paid=PRO_PACKAGE_PRICE,
        purchased_at=now,
        expires_at=expires_at,
        payos_order_id=payos_order_id,
        is_active=True
    )
    db.add(package)
    
    # Upgrade to PRO if not already
    if user.account_tier != "PRO":
        user.account_tier = "PRO"
    
    # Log transaction
    transaction = CreditTransaction(
        user_id=user.id,
        amount=PRO_CREDITS_PER_PACKAGE,
        transaction_type="PURCHASE",
        description=f"Mua gói {PRO_CREDITS_PER_PACKAGE} credits - {PRO_PACKAGE_PRICE:,.0f} VNĐ",
        package_id=package.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(package)
    
    return package


def get_credit_history(user: User, db: Session, limit: int = 50, offset: int = 0) -> dict:
    """Lấy lịch sử giao dịch credits"""
    total = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user.id
    ).count()
    
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user.id
    ).order_by(
        CreditTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return {
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "transaction_type": t.transaction_type,
                "description": t.description,
                "created_at": t.created_at
            }
            for t in transactions
        ],
        "total": total
    }


def _reset_daily_credits_if_needed(user: User, db: Session):
    """
    Reset daily credits nếu đã qua ngày mới (theo giờ Vietnam).
    Credits Free KHÔNG cộng dồn — luôn reset về 5.
    """
    vn_now = get_vn_now()
    
    if user.daily_credits_reset_at is None:
        # First time - set credits and reset time
        user.daily_credits_remaining = FREE_DAILY_CREDITS
        user.daily_credits_reset_at = vn_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        db.commit()
        return
    
    # Make reset_at timezone-aware for comparison
    reset_at = user.daily_credits_reset_at
    if reset_at.tzinfo is None:
        reset_at = reset_at.replace(tzinfo=VN_TZ)
    
    if vn_now >= reset_at:
        # Reset credits
        user.daily_credits_remaining = FREE_DAILY_CREDITS
        user.daily_credits_reset_at = vn_now.replace(
            hour=0, minute=0, second=0, microsecond=0
        ) + timedelta(days=1)
        
        # Log daily grant
        transaction = CreditTransaction(
            user_id=user.id,
            amount=FREE_DAILY_CREDITS,
            transaction_type="DAILY_GRANT",
            description=f"Cấp {FREE_DAILY_CREDITS} credits miễn phí hàng ngày"
        )
        db.add(transaction)
        db.commit()
