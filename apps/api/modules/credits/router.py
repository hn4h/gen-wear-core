from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.service import get_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.auth.database import get_db
from apps.api.modules.credits.service import (
    get_credit_balance,
    get_credit_history,
    purchase_credits
)
from apps.api.modules.credits.payos_service import (
    create_payment_link,
    verify_webhook_signature
)
from apps.api.modules.credits.schemas import (
    PurchaseCreditsRequest,
    PurchaseCreditsResponse
)
from fastapi import HTTPException
import logging

router = APIRouter()


@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xem số credits hiện tại"""
    return get_credit_balance(current_user, db)


@router.get("/history")
def get_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xem lịch sử giao dịch credits"""
    return get_credit_history(current_user, db, limit=limit, offset=offset)


@router.post("/purchase")
def create_purchase(
    request: PurchaseCreditsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo link thanh toán PayOS để mua credits"""
    try:
        result = create_payment_link(
            user=current_user,
            return_url=request.return_url,
            cancel_url=request.cancel_url
        )
        return result
    except Exception as e:
        logging.exception("Error creating payment link")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def payos_webhook(request: Request, db: Session = Depends(get_db)):
    """
    PayOS webhook callback khi thanh toán thành công.
    PayOS sẽ gọi endpoint này tự động.
    """
    try:
        payload = await request.json()
        logging.info(f"PayOS webhook received: {payload}")
        
        # Verify webhook signature
        if not verify_webhook_signature(payload):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        data = payload.get("data", {})
        order_code = str(data.get("orderCode", ""))
        status_code = data.get("code", "")
        
        # Only process successful payments
        if status_code != "00":
            logging.info(f"Payment not successful, code: {status_code}")
            return {"message": "Acknowledged"}
        
        # Extract user_id from orderCode (format: {timestamp}{user_id_short})
        # We store the mapping in the description or use a lookup
        description = data.get("description", "")
        
        # Find user by searching for pending order
        from apps.api.modules.credits.models import CreditPackage
        
        # The orderCode is stored as payos_order_id in a pending package
        # or we extract user_id from the description
        user_id = _extract_user_id_from_description(description)
        if not user_id:
            logging.error(f"Could not extract user_id from description: {description}")
            return {"message": "Acknowledged"}
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logging.error(f"User not found: {user_id}")
            return {"message": "Acknowledged"}
        
        # Check if already processed (idempotency)
        existing = db.query(CreditPackage).filter(
            CreditPackage.payos_order_id == order_code
        ).first()
        if existing:
            logging.info(f"Order {order_code} already processed")
            return {"message": "Already processed"}
        
        # Create credit package
        purchase_credits(user, db, payos_order_id=order_code)
        logging.info(f"Credits purchased for user {user.id}, order {order_code}")
        
        return {"message": "Success"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error processing PayOS webhook")
        raise HTTPException(status_code=500, detail=str(e))


def _extract_user_id_from_description(description: str) -> str:
    """
    Extract user_id from PayOS description.
    Format: "GENWEAR_{user_id}"
    """
    if description and description.startswith("GENWEAR_"):
        return description.replace("GENWEAR_", "")
    return ""
