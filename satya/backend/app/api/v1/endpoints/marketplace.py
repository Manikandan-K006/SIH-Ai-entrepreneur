# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.business import BusinessProfile, Product, Service
from app.models.marketplace import Order, OrderItem
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/marketplace", tags=["Marketplace MVP"])


class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: float
    unit: str = "piece"
    in_stock: bool = True
    stock_quantity: int = 10
    images: Optional[List[str]] = None


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = 1


class OrderCreate(BaseModel):
    business_profile_id: int
    order_type: str = "pickup" # pickup, local_delivery
    items: List[OrderItemInput]
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


@router.get("/products")
def list_products(
    category: Optional[str] = Query(None),
    business_id: Optional[int] = Query(None),
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(Product).join(BusinessProfile)
    if category:
        q = q.filter(Product.category == category)
    if business_id:
        q = q.filter(Product.business_profile_id == business_id)
    
    prods = q.offset(skip).limit(limit).all()
    results = []
    for p in prods:
        b = p.business_profile
        results.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "price": p.price,
            "unit": p.unit,
            "in_stock": p.in_stock,
            "stock_quantity": p.stock_quantity,
            "images": p.images,
            "is_promoted": p.is_promoted,
            "business_id": b.id,
            "business_name": b.business_name or "Local Entrepreneur",
            "location": f"{b.village_town or ''}, {b.district or ''}".strip(", "),
            "phone": b.phone,
            "share_code": b.share_code,
            "verification_status": b.verification_status,
        })
    return results


@router.post("/products")
def add_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not biz:
        biz = BusinessProfile(user_id=current_user.id, business_name=f"{current_user.full_name}'s Enterprise")
        db.add(biz)
        db.commit()
        db.refresh(biz)

    prod = Product(
        business_profile_id=biz.id,
        name=data.name,
        category=data.category or biz.business_category,
        description=data.description,
        price=data.price,
        unit=data.unit,
        in_stock=data.in_stock,
        stock_quantity=data.stock_quantity,
        images=data.images or []
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not biz:
        raise HTTPException(status_code=403, detail="Not authorized")
    prod = db.query(Product).filter(Product.id == product_id, Product.business_profile_id == biz.id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/orders")
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.id == data.business_profile_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    order_items_to_create = []

    for item_input in data.items:
        p = db.query(Product).filter(Product.id == item_input.product_id, Product.business_profile_id == biz.id).first()
        if not p:
            raise HTTPException(status_code=404, detail=f"Product ID {item_input.product_id} not available for this business")
        if not p.in_stock:
            raise HTTPException(status_code=400, detail=f"Product '{p.name}' is currently out of stock")
        
        item_total = p.price * item_input.quantity
        total_amount += item_total
        order_items_to_create.append({
            "product_id": p.id,
            "product_name": p.name,
            "quantity": item_input.quantity,
            "unit_price": p.price,
            "item_total": item_total
        })

    order = Order(
        customer_id=current_user.id,
        business_profile_id=biz.id,
        order_type=data.order_type,
        status="pending",
        total_amount=total_amount,
        delivery_address=data.delivery_address,
        contact_phone=data.contact_phone or current_user.phone,
        notes=data.notes
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for oi in order_items_to_create:
        db.add(OrderItem(order_id=order.id, **oi))

    db.commit()
    db.refresh(order)
    return {
        "id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "message": f"Order request sent to {biz.business_name or 'Entrepreneur'}. You will receive a notification when accepted."
    }


@router.get("/orders")
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Customer orders or Entrepreneur received orders
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    
    customer_orders = db.query(Order).filter(Order.customer_id == current_user.id).order_by(Order.created_at.desc()).all()
    entrepreneur_orders = []
    if biz:
        entrepreneur_orders = db.query(Order).filter(Order.business_profile_id == biz.id).order_by(Order.created_at.desc()).all()

    return {
        "customer_orders": customer_orders,
        "received_orders": entrepreneur_orders
    }


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str = Query(..., regex="^(accepted|rejected|completed|cancelled)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    is_seller = biz and biz.id == order.business_profile_id
    is_buyer = order.customer_id == current_user.id

    if not (is_seller or is_buyer):
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    order.status = status
    db.commit()
    return {"order_id": order.id, "status": order.status}
