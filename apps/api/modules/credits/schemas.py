from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CreditBalanceResponse(BaseModel):
    """Response cho endpoint xem số credits"""
    daily_credits_remaining: int
    pro_credits_remaining: int
    total_available: int
    account_tier: str
    daily_reset_at: Optional[str] = None


class CreditHistoryItem(BaseModel):
    """Một dòng trong lịch sử credit"""
    id: str
    amount: int
    transaction_type: str
    description: Optional[str] = None
    created_at: datetime


class CreditHistoryResponse(BaseModel):
    """Response cho endpoint lịch sử credits"""
    transactions: List[CreditHistoryItem]
    total: int


class PurchaseCreditsRequest(BaseModel):
    """Request mua credits (PRO users only)"""
    package_id: int = Field(..., description="Package ID: 1=20 credits (100k), 2=50 credits (200k), 3=100 credits (350k)")
    return_url: str  # URL redirect sau khi thanh toán
    cancel_url: str  # URL redirect khi hủy


class CreditPackageOption(BaseModel):
    """Credit package option"""
    id: int
    credits: int
    price: int
    price_per_credit: int
    discount_percentage: int = 0


class AvailablePackagesResponse(BaseModel):
    """Available credit packages for PRO users"""
    packages: List[CreditPackageOption]


class PurchaseCreditsResponse(BaseModel):
    """Response tạo link thanh toán"""
    checkout_url: str
    order_id: str
    amount: int
    credits: int


class PayOSWebhookPayload(BaseModel):
    """Payload từ PayOS webhook callback"""
    code: str
    id: str
    orderCode: int
    amount: int
    status: str
    desc: Optional[str] = None
