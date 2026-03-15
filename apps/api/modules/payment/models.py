from sqlalchemy import Column, String, DateTime
import uuid
from datetime import datetime
from apps.api.modules.auth.database import Base


class ProcessedPaymentEvent(Base):
    """Stores processed PayOS order codes to keep webhook handling idempotent."""
    __tablename__ = "processed_payment_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    order_code = Column(String, unique=True, index=True, nullable=False)
    payment_type = Column(String, nullable=False)
    user_id = Column(String, nullable=True, index=True)
    description = Column(String, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProcessedPaymentEvent order_code={self.order_code} type={self.payment_type}>"
