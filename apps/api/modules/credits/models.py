from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base

class CreditPackage(Base):
    """Gói credit đã mua bởi Pro user"""
    __tablename__ = "credit_packages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    credits_total = Column(Integer, nullable=False)
    credits_remaining = Column(Integer, nullable=False)
    amount_paid = Column(Float, nullable=False)  # VNĐ
    purchased_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    payos_order_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    transactions = relationship("CreditTransaction", back_populates="package")
    
    def __repr__(self):
        return f"<CreditPackage {self.id} user={self.user_id} remaining={self.credits_remaining}>"


class CreditTransaction(Base):
    """Lịch sử sử dụng/mua credit"""
    __tablename__ = "credit_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # + for grants/purchases, - for usage
    transaction_type = Column(String, nullable=False)  # DAILY_GRANT, PURCHASE, GENERATE, EDIT
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    package_id = Column(String, ForeignKey("credit_packages.id"), nullable=True)
    
    # Relationships
    package = relationship("CreditPackage", back_populates="transactions")
    
    def __repr__(self):
        return f"<CreditTransaction {self.id} type={self.transaction_type} amount={self.amount}>"
