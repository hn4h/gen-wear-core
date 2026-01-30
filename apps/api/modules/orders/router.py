from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_user, get_current_admin_user
from apps.api.modules.auth.models import User
from apps.api.modules.orders.models import Order, OrderItem, OrderStatus
from apps.api.modules.cart.models import Cart, CartItem
from apps.api.modules.products.models import Product
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Schemas
class OrderItemBase(BaseModel):
    product_id: str
    quantity: int

class CreateOrderRequest(BaseModel):
    full_name: str
    phone_number: str
    email: str
    address: str
    city: str
    payment_method: str = "cod"
    items: Optional[List[OrderItemBase]] = None # Optional: If not provided, use cart

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    price: float
    product_name: str
    product_image: Optional[str]

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    full_name: str
    phone_number: str
    email: str
    address: str
    city: str
    payment_method: str
    status: str
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# Helpers
def map_order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        full_name=order.full_name,
        phone_number=order.phone_number,
        email=order.email,
        address=order.address,
        city=order.city,
        payment_method=order.payment_method,
        status=order.status,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                product_name=item.product.name,
                product_image=item.product.image_url
            ) for item in order.items
        ]
    )

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Determine items to order
    items_to_process = []
    
    if order_data.items:
        # Create from direct payload (legacy support or direct buy)
        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            items_to_process.append({
                "product": product,
                "quantity": item.quantity
            })
    else:
        # Create from Cart
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()
        if not cart or not cart.items:
             raise HTTPException(status_code=400, detail="Cart is empty")
        
        for cart_item in cart.items:
            items_to_process.append({
                "product": cart_item.product,
                "quantity": cart_item.quantity
            })
            
    if not items_to_process:
        raise HTTPException(status_code=400, detail="No items to order")

    # Calculate Total
    total_amount = sum(item["product"].price * item["quantity"] for item in items_to_process)
    
    # Create Order
    new_order = Order(
        user_id=user.id,
        full_name=order_data.full_name,
        phone_number=order_data.phone_number,
        email=order_data.email,
        address=order_data.address,
        city=order_data.city,
        payment_method=order_data.payment_method,
        total_amount=total_amount,
        status=OrderStatus.PENDING
    )
    db.add(new_order)
    db.flush() # Generate ID
    
    # Create Order Items
    for item in items_to_process:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price=item["product"].price
        )
        db.add(order_item)
        
        # Optional: Reduce Stock here
        # item["product"].stock -= item["quantity"]
        
    # Clear Cart if used
    if not order_data.items:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    return map_order_response(new_order)

@router.get("/my", response_model=List[OrderResponse])
async def get_my_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get current user's order history"""
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return [map_order_response(order) for order in orders]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get specific order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Verify ownership or admin
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return map_order_response(order)

# --- Admin Endpoints ---

@router.get("/", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin: List all orders"""
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
        
    query = query.order_by(Order.created_at.desc())
        
    total = query.count()
    offset = (page - 1) * page_size
    orders = query.offset(offset).limit(page_size).all()
    
    import math
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return OrderListResponse(
        orders=[map_order_response(order) for order in orders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin: Update order status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    
    return map_order_response(order)
