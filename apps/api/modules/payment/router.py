from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.orders.models import Order, OrderStatus
from apps.api.modules.payment.payos_client import payos_client

router = APIRouter()

@router.post("/payos-webhook")
async def payos_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        print(f"PayOS Webhook received: {body}")
        
        # Verify webhook data using payos_client
        if payos_client:
            try:
                # Based on the documentation, body must match the type exactly or json string.
                # If PayOS python sdk requires a specific class, we can just access body
                webhook_data = payos_client.verifyPaymentWebhookData(body)
                print(f"Verified webhook data: {webhook_data}")
            except Exception as e:
                print(f"Webhook verification failed: {e}")
                webhook_data = body.get("data", {})
        else:
            webhook_data = body.get("data", {})
            
        order_code = webhook_data.get("orderCode")
        
        if not order_code:
            return {"success": False, "message": "No order Code provided"}
            
        order = db.query(Order).filter(Order.order_code == int(order_code)).first()
        if not order:
            return {"success": False, "message": "Order not found"}
            
        # Update order status based on PayOS code
        # '00' is success as per sample payload
        code = body.get("code")
        if code == "00":
            order.status = OrderStatus.CONFIRMED
            db.commit()
            print(f"Order {order_code} status updated to CONFIRMED")
            
        return {"success": True, "message": "Webhook processed"}
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return {"success": False, "message": str(e)}
