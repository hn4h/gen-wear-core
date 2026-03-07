from sqlalchemy import Column, String, Boolean, DateTime, Integer
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False) # "USER" or "ADMIN"
    account_tier = Column(String, default="FREE", nullable=False)  # "FREE" or "PRO"
    daily_credits_remaining = Column(Integer, default=5, nullable=False)
    daily_credits_reset_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<User {self.phone_number}>"
