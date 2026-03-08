from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.service import get_current_user, check_and_update_subscription_status
from apps.api.modules.auth.models import User
from apps.api.modules.auth.database import get_db
from apps.api.modules.credits.service import (
    get_credit_balance,
    get_credit_history,
    purchase_credits,
    get_available_packages,
    CREDIT_PACKAGES
)
from apps.api.modules.credits.payos_service import (
    create_payment_link_for_package,
    verify_webhook_signature
)
from apps.api.modules.credits.schemas import (
    PurchaseCreditsRequest,
    PurchaseCreditsResponse,
    AvailablePackagesResponse,
    CreditPackageOption
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


@router.get("/packages", response_model=AvailablePackagesResponse)
def get_packages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xem các gói credits có sẵn (chỉ cho PRO users)"""
    # Check subscription status
    current_user = check_and_update_subscription_status(db, current_user)
    
    if current_user.account_tier != "PRO":
        raise HTTPException(
            status_code=403,
            detail="Only PRO users can purchase credit packages. Please upgrade to PRO first."
        )
    
    packages = get_available_packages()
    return AvailablePackagesResponse(
        packages=[CreditPackageOption(**pkg) for pkg in packages]
    )


@router.post("/purchase", response_model=PurchaseCreditsResponse)
def create_purchase(
    request: PurchaseCreditsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo link thanh toán PayOS để mua credits (chỉ PRO users)"""
    try:
        # Check subscription status
        current_user = check_and_update_subscription_status(db, current_user)
        
        if current_user.account_tier != "PRO":
            raise HTTPException(
                status_code=403,
                detail="Only PRO users can purchase credit packages. Please upgrade to PRO first."
            )
        
        # Validate package
        if request.package_id not in CREDIT_PACKAGES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid package_id. Must be one of: {list(CREDIT_PACKAGES.keys())}"
            )
        
        result = create_payment_link_for_package(
            user=current_user,
            package_id=request.package_id,
            return_url=request.return_url,
            cancel_url=request.cancel_url
        )
        return result
    except HTTPException:
        raise
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
        
        data = payload.get("data", {})
        order_code = str(data.get("orderCode", ""))
        code = payload.get("code", "")
        
        # Only process successful payments
        if code != "00":
            logging.info(f"Payment not successful, code: {code}")
            return {"success": True, "message": "Acknowledged"}
        
        description = data.get("description", "")
        
        # Extract user_id and package_id from description
        # Format: "CR{package_id} {user_id_short}"
        user_id_short, package_id = _extract_info_from_description(description)
        
        if not user_id_short or not package_id:
            logging.error(f"Could not extract info from description: {description}")
            return {"success": False, "message": "Invalid description"}
        
        # Find user by partial ID match
        user = db.query(User).filter(User.id.startswith(user_id_short)).first()
        if not user:
            logging.error(f"User not found: {user_id}")
            return {"success": False, "message": "User not found"}
        
        # Check if already processed (idempotency)
        from apps.api.modules.credits.models import CreditPackage
        existing = db.query(CreditPackage).filter(
            CreditPackage.payos_order_id == order_code
        ).first()
        if existing:
            logging.info(f"Order {order_code} already processed")
            return {"success": True, "message": "Already processed"}
        
        # Create credit package
        purchase_credits(user, db, package_id, payos_order_id=order_code)
        logging.info(f"Credits purchased for user {user.id}, order {order_code}")
        
        return {"success": True, "message": "Credits added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error processing PayOS webhook")
        return {"success": False, "message": str(e)}


def _extract_info_from_description(description: str) -> tuple:
    """
    Extract user_id and package_id from PayOS description.
    Format: "CR{package_id} {user_id_short}"
    Returns: (user_id, package_id)
    """
    try:
        if description and description.startswith("CR"):
            parts = description.split(" ")
            if len(parts) >= 2:
                # Extract package_id from CR1, CR2, etc
                package_id = int(parts[0].replace("CR", ""))
                # Get partial user_id
                user_id_short = parts[1]
                return user_id_short, package_id
    except Exception as e:
        logging.error(f"Error parsing description: {e}")
    
    return None, None
