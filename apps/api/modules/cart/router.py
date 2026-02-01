from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from apps.api.modules.auth.database import get_db
from apps.api.modules.auth.service import get_current_user
from apps.api.modules.auth.models import User
from apps.api.modules.cart.models import Cart, CartItem
from apps.api.modules.products.models import Product
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Schemas
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class ProductSchema(BaseModel):
    id: str
    name: str
    price: float
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: ProductSchema
    
    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    total_price: float
    total_items: int
    
    class Config:
        from_attributes = True

def get_cart_response(cart: Cart) -> CartResponse:
    # Ensure items are loaded and validated
    cart_items = cart.items if cart.items else []
    validated_items = [CartItemResponse.model_validate(item) for item in cart_items]
    
    total_price = sum(item.quantity * item.product.price for item in validated_items)
    total_items = sum(item.quantity for item in validated_items)
    
    return CartResponse(
        id=cart.id,
        items=validated_items,
        total_price=total_price,
        total_items=total_items
    )

@router.get("/", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return get_cart_response(cart)

@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item_in: CartItemAdd,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        

    
    # Check if product exists
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        # Check if item already in cart
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += item_in.quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=item_in.product_id,
                quantity=item_in.quantity
            )
            db.add(cart_item)
        
        db.commit()
        db.refresh(cart)
        return get_cart_response(cart)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error adding item to cart: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add item: {str(e)}")

@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: str,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if item_update.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = item_update.quantity
        
    db.commit()
    db.refresh(cart)
    return get_cart_response(cart)

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return get_cart_response(cart)

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if cart:
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
