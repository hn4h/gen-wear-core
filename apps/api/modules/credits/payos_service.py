import os
import hashlib
import hmac
import json
import time
import logging
from apps.api.modules.auth.models import User
from apps.api.modules.credits.service import PRO_CREDITS_PER_PACKAGE, PRO_PACKAGE_PRICE

# PayOS Configuration
PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID", "")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY", "")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY", "")
PAYOS_API_URL = "https://api-merchant.payos.vn"


def create_payment_link(user: User, return_url: str, cancel_url: str) -> dict:
    """
    Tạo link thanh toán PayOS.
    Returns dict with checkout_url, order_id, amount, credits
    """
    import requests
    
    order_code = int(time.time() * 1000) % 2147483647  # Ensure fits in int32
    amount = int(PRO_PACKAGE_PRICE)
    description = f"GENWEAR_{user.id}"
    
    # Create payment data
    payment_data = {
        "orderCode": order_code,
        "amount": amount,
        "description": description,
        "items": [
            {
                "name": f"Gói {PRO_CREDITS_PER_PACKAGE} Credits Gen Wear",
                "quantity": 1,
                "price": amount
            }
        ],
        "returnUrl": return_url,
        "cancelUrl": cancel_url
    }
    
    # Create signature
    signature_data = f"amount={amount}&cancelUrl={cancel_url}&description={description}&orderCode={order_code}&returnUrl={return_url}"
    signature = hmac.new(
        PAYOS_CHECKSUM_KEY.encode('utf-8'),
        signature_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    payment_data["signature"] = signature
    
    # Call PayOS API
    headers = {
        "Content-Type": "application/json",
        "x-client-id": PAYOS_CLIENT_ID,
        "x-api-key": PAYOS_API_KEY
    }
    
    response = requests.post(
        f"{PAYOS_API_URL}/v2/payment-requests",
        json=payment_data,
        headers=headers
    )
    
    if response.status_code != 200:
        logging.error(f"PayOS API error: {response.text}")
        raise Exception(f"PayOS API error: {response.status_code}")
    
    result = response.json()
    
    if result.get("code") != "00":
        logging.error(f"PayOS error: {result}")
        raise Exception(f"PayOS error: {result.get('desc', 'Unknown error')}")
    
    data = result.get("data", {})
    
    return {
        "checkout_url": data.get("checkoutUrl", ""),
        "order_id": str(order_code),
        "amount": amount,
        "credits": PRO_CREDITS_PER_PACKAGE
    }


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
