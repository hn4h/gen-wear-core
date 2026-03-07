from sqlalchemy import Column, String, Integer, BigInteger, Float, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from apps.api.modules.auth.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    order_code = Column(BigInteger, unique=True, index=True, nullable=True) # PayOS requires integer ID
    user_id = Column(String, ForeignKey("users.id"), nullable=True) # Check if guest orders are allowed, currently enforcing user login for order history
    
    # Shipping Info (Snapshotted at time of order)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    
    # Payment Info
    payment_method = Column(String, default="cod")
    
    # Custom design notes (for AI design orders)
    custom_notes = Column(String, nullable=True)
    
    # Order Status
    status = Column(String, default=OrderStatus.PENDING)
    total_amount = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    user = relationship("apps.api.modules.auth.models.User")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)  # Nullable for custom design orders
    
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False) # Snapshot price at time of order
    
    # Snapshot fields (used when product_id is None for custom orders)
    product_name_snapshot = Column(String, nullable=True)
    product_image_snapshot = Column(String, nullable=True)
    
    # Custom AI Design fields
    is_custom_design = Column(Boolean, default=False)
    design_image_url = Column(String, nullable=True)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("apps.api.modules.products.models.Product", foreign_keys=[product_id])
