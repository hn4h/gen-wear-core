from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.schemas import (
    RegisterRequest, RegisterResponse, 
    LoginRequest, TokenResponse, UserResponse,
    UserProfileUpdate, PasswordChange,
    UpgradeToProRequest, UpgradeToProResponse,
    SubscriptionStatusResponse
)
from apps.api.modules.auth.service import (
    create_user, authenticate_user, create_access_token, get_current_user,
    update_user, change_password, upgrade_to_pro,
    check_and_update_subscription_status, get_subscription_status
)
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.models import User
from apps.api.modules.payment.payos_client import payos_client
from payos import PaymentData
import time
import logging

router = APIRouter()

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with phone number and password"""
    try:
        user = create_user(
            db=db,
            phone_number=request.phone_number,
            full_name=request.full_name,
            password=request.password
        )
        
        return RegisterResponse(
            user_id=str(user.id),
            phone_number=user.phone_number,
            full_name=user.full_name
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with phone number and password"""
    user = authenticate_user(db, request.phone_number, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            phone_number=user.phone_number,
            full_name=user.full_name,
            role=user.role,
            account_tier=user.account_tier,
            daily_credits_remaining=user.daily_credits_remaining,
            pro_subscription_status=user.pro_subscription_status,
            pro_subscription_end=user.pro_subscription_end,
            created_at=user.created_at,
            is_active=user.is_active
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    # Check and update subscription status
    current_user = check_and_update_subscription_status(db, current_user)
    
    return UserResponse(
        id=str(current_user.id),
        phone_number=current_user.phone_number,
        full_name=current_user.full_name,
        role=current_user.role,
        account_tier=current_user.account_tier,
        daily_credits_remaining=current_user.daily_credits_remaining,
        pro_subscription_status=current_user.pro_subscription_status,
        pro_subscription_end=current_user.pro_subscription_end,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.put("/me", response_model=UserResponse)
async def update_profile(
    request: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    if request.full_name:
        current_user = update_user(db, current_user, request.full_name)
    
    return UserResponse(
        id=str(current_user.id),
        phone_number=current_user.phone_number,
        full_name=current_user.full_name,
        role=current_user.role,
        account_tier=current_user.account_tier,
        daily_credits_remaining=current_user.daily_credits_remaining,
        pro_subscription_status=current_user.pro_subscription_status,
        pro_subscription_end=current_user.pro_subscription_end,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(
    request: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change current user password"""
    change_password(db, current_user, request.current_password, request.new_password)
    return {"message": "Password updated successfully"}

@router.get("/subscription", response_model=SubscriptionStatusResponse)
async def get_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current subscription status"""
    current_user = check_and_update_subscription_status(db, current_user)
    subscription_info = get_subscription_status(current_user)
    return SubscriptionStatusResponse(**subscription_info)

@router.post("/upgrade-to-pro", response_model=UpgradeToProResponse)
async def create_pro_upgrade(
    request: UpgradeToProRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create PayOS payment link to upgrade to PRO (30 days)"""
    if not payos_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    # Check if already PRO and active
    current_user = check_and_update_subscription_status(db, current_user)
    
    # PRO subscription price: 99,000 VND for 30 days
    amount = 99000
    duration_days = 30
    
    # Create unique order code using timestamp and user_id
    order_code = int(f"{int(time.time())}{current_user.id[:4]}"[:9])
    
    # Description max 25 chars for PayOS
    description = f"PRO {current_user.id[:8]}"
    
    try:
        # Create payment link using PayOS
        payment_data = PaymentData(
            orderCode=order_code,
            amount=amount,
            description=description,
            returnUrl=request.return_url,
            cancelUrl=request.cancel_url
        )
        
        payment_link_response = payos_client.createPaymentLink(payment_data)
        
        logging.info(f"Created PRO upgrade payment for user {current_user.id}: {order_code}")
        
        return UpgradeToProResponse(
            checkout_url=payment_link_response.checkoutUrl,
            order_code=str(order_code),
            amount=amount,
            description=f"Nâng cấp PRO {duration_days} ngày"
        )
    except Exception as e:
        logging.exception("Error creating PRO upgrade payment link")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment link: {str(e)}"
        )

@router.post("/pro-webhook")
async def pro_upgrade_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """PayOS webhook for PRO upgrade payments"""
    try:
        payload = await request.json()
        logging.info(f"PRO upgrade webhook received: {payload}")
        
        # Verify webhook signature if needed
        if payos_client:
            try:
                webhook_data = payos_client.verifyPaymentWebhookData(payload)
            except Exception as e:
                logging.error(f"Webhook verification failed: {e}")
                webhook_data = payload.get("data", {})
        else:
            webhook_data = payload.get("data", {})
        
        code = payload.get("code")
        if code != "00":
            logging.info(f"Payment not successful, code: {code}")
            return {"success": True, "message": "Acknowledged"}
        
        description = webhook_data.get("description", "")
        
        # Extract user_id from description (format: "PRO {user_id}")
        if description.startswith("PRO "):
            user_id = description.replace("PRO ", "").strip()
            user = db.query(User).filter(User.id.startswith(user_id)).first()
            
            if user:
                # Upgrade user to PRO
                upgrade_to_pro(db, user, duration_days=30)
                logging.info(f"User {user_id} upgraded to PRO successfully")
                return {"success": True, "message": "User upgraded to PRO"}
            else:
                logging.error(f"User not found: {user_id}")
                return {"success": False, "message": "User not found"}
        else:
            logging.error(f"Invalid description format: {description}")
            return {"success": False, "message": "Invalid description"}
            
    except Exception as e:
        logging.exception("Error processing PRO upgrade webhook")
        return {"success": False, "message": str(e)}
