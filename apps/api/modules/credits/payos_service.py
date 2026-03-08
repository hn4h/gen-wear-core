import os
import hashlib
import hmac
import json
import time
import logging
from apps.api.modules.auth.models import User
from apps.api.modules.credits.service import CREDIT_PACKAGES
from payos import PaymentData

# PayOS Configuration
PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID", "")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY", "")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY", "")
PAYOS_API_URL = "https://api-merchant.payos.vn"


def create_payment_link_for_package(user: User, package_id: int, return_url: str, cancel_url: str) -> dict:
    """
    Tạo link thanh toán PayOS cho gói credits cụ thể.
    Returns dict with checkout_url, order_id, amount, credits
    """
    from apps.api.modules.payment.payos_client import payos_client
    
    if not payos_client:
        raise Exception("PayOS client not configured")
    
    # Get package info
    if package_id not in CREDIT_PACKAGES:
        raise Exception(f"Invalid package_id: {package_id}")
    
    package_info = CREDIT_PACKAGES[package_id]
    
    order_code = int(f"{int(time.time())}{user.id[:4]}"[:9])
    amount = package_info["price"]
    # Description max 25 chars for PayOS
    description = f"CR{package_id} {user.id[:8]}"
    
    try:
        # Create payment data using PaymentData class
        payment_data = PaymentData(
            orderCode=order_code,
            amount=amount,
            description=description,
            returnUrl=return_url,
            cancelUrl=cancel_url
        )
        
        payment_link_response = payos_client.createPaymentLink(payment_data)
        
        logging.info(f"Created payment link for user {user.id}, package {package_id}: {order_code}")
        
        return {
            "checkout_url": payment_link_response.checkoutUrl,
            "order_id": str(order_code),
            "amount": amount,
            "credits": package_info["credits"]
        }
    except Exception as e:
        logging.exception(f"Error creating payment link: {e}")
        raise


def verify_webhook_signature(payload: dict) -> bool:
    """
    Xác minh chữ ký webhook từ PayOS.
    Returns True nếu hợp lệ.
    """
    if not PAYOS_CHECKSUM_KEY:
        logging.warning("PAYOS_CHECKSUM_KEY not set, skipping verification")
        return True  # Skip verification in dev mode
    
    try:
        data = payload.get("data", {})
        signature = payload.get("signature", "")
        
        # Build signature string from data (sorted keys)
        sorted_data = sorted(data.items())
        signature_data = "&".join(f"{k}={v}" for k, v in sorted_data)
        
        expected_signature = hmac.new(
            PAYOS_CHECKSUM_KEY.encode('utf-8'),
            signature_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logging.exception("Error verifying webhook signature")
        return False
