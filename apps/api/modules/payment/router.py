from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.models import User
from apps.api.modules.auth.service import upgrade_to_pro
from apps.api.modules.credits.service import purchase_credits
from apps.api.modules.credits.models import CreditPackage
from apps.api.modules.payment.models import ProcessedPaymentEvent
from apps.api.modules.orders.models import Order, OrderStatus
from apps.api.modules.payment.payos_client import payos_client
import logging

router = APIRouter()

@router.post("/payos-webhook")
async def payos_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        logging.info(f"PayOS webhook received: {body}")
        
        # Verify webhook data using payos_client
        if payos_client:
            try:
                webhook_data = payos_client.verifyPaymentWebhookData(body)
                logging.info(f"Verified webhook data: {webhook_data}")
            except Exception as e:
                logging.error(f"Webhook verification failed: {e}")
                webhook_data = body.get("data", {})
        else:
            webhook_data = body.get("data", {})

        # '00' is success as per PayOS payload format
        code = body.get("code")
        if code != "00":
            logging.info(f"Payment not successful, code: {code}")
            return {"success": True, "message": "Acknowledged"}

        order_code = str(webhook_data.get("orderCode", ""))
        description = str(webhook_data.get("description", "")).strip()

        # Handle account upgrades from description format:
        # - PRO {user_id_short}
        # - ULTRA {user_id_short}
        if description.startswith("PRO ") or description.startswith("ULTRA "):
            user_id_short = description.split(" ", 1)[1].strip() if " " in description else ""
            if not user_id_short:
                return {"success": False, "message": "Invalid upgrade description"}

            if not order_code:
                return {"success": False, "message": "No order code provided"}

            existing_event = db.query(ProcessedPaymentEvent).filter(
                ProcessedPaymentEvent.order_code == order_code
            ).first()
            if existing_event:
                return {"success": True, "message": "Already processed"}

            user = db.query(User).filter(User.id.startswith(user_id_short)).first()
            if not user:
                return {"success": False, "message": "User not found"}

            # ULTRA currently shares PRO subscription activation behavior.
            upgrade_to_pro(db, user, duration_days=30, commit=False)

            event = ProcessedPaymentEvent(
                order_code=order_code,
                payment_type="SUBSCRIPTION_UPGRADE",
                user_id=user.id,
                description=description,
            )
            db.add(event)
            db.commit()
            logging.info(f"User {user.id} upgraded from webhook order {order_code}")
            return {"success": True, "message": "Subscription upgraded"}

        # Handle credit package purchases from description format: CR{package_id} {user_id_short}
        if description.startswith("CR"):
            parts = description.split(" ")
            if len(parts) < 2:
                return {"success": False, "message": "Invalid credits description"}

            package_token = parts[0].replace("CR", "")
            user_id_short = parts[1].strip()
            try:
                package_id = int(package_token)
            except ValueError:
                return {"success": False, "message": "Invalid package id"}

            user = db.query(User).filter(User.id.startswith(user_id_short)).first()
            if not user:
                return {"success": False, "message": "User not found"}

            existing = db.query(CreditPackage).filter(CreditPackage.payos_order_id == order_code).first()
            if existing:
                return {"success": True, "message": "Already processed"}

            purchase_credits(user, db, package_id, payos_order_id=order_code)
            logging.info(f"Credits purchased for user {user.id}, order {order_code}")
            return {"success": True, "message": "Credits added successfully"}

        # Fallback: process normal ecommerce order payment.
        if not order_code:
            return {"success": False, "message": "No order code provided"}

        order = db.query(Order).filter(Order.order_code == int(order_code)).first()
        if not order:
            return {"success": False, "message": "Order not found"}

        order.status = OrderStatus.CONFIRMED
        db.commit()
        logging.info(f"Order {order_code} status updated to CONFIRMED")
        return {"success": True, "message": "Order confirmed"}
    except Exception as e:
        logging.exception(f"Error processing webhook: {e}")
        return {"success": False, "message": str(e)}
