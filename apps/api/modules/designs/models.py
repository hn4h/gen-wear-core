from sqlalchemy import Column, String, DateTime, ForeignKey
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base

class SavedDesign(Base):
    __tablename__ = "saved_designs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    image_url = Column(String, nullable=False)
    prompt = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
