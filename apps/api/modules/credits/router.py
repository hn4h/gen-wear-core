from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.service import get_current_user, check_and_update_subscription_status
from apps.api.modules.auth.models import User
from apps.api.modules.auth.database import get_db
from apps.api.modules.credits.service import (
    get_credit_balance,
    get_credit_history,
    get_available_packages,
    CREDIT_PACKAGES
)
from apps.api.modules.credits.payos_service import (
    create_payment_link_for_package
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
    """Backward-compatible endpoint that delegates to the unified PayOS webhook."""
    from apps.api.modules.payment.router import payos_webhook as unified_payos_webhook

    return await unified_payos_webhook(request=request, db=db)
