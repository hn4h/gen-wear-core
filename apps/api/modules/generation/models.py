from sqlalchemy import Column, String, DateTime, Text
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base


class AIGenerationLog(Base):
    """Tracks every AI bandana generation attempt (regardless of whether user saves it)."""
    __tablename__ = "ai_generation_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, nullable=True)   # nullable – can be anonymous
    prompt = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
