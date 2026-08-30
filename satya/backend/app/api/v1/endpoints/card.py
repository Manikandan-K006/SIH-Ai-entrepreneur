import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.business import BusinessProfile, Product, Service
from app.models.entrepreneur import EntrepreneurProfile
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/card", tags=["Digital Business Card"])


@router.get("/my-card")
def get_my_digital_card(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not biz:
        biz = BusinessProfile(
            user_id=current_user.id,
            business_name=f"{current_user.full_name}'s Enterprise",
            phone=current_user.phone,
            share_code=str(uuid.uuid4())[:8]
        )
        db.add(biz)
        db.commit()
        db.refresh(biz)

    if not biz.share_code:
        biz.share_code = str(uuid.uuid4())[:8]
        db.commit()

    products = db.query(Product).filter(Product.business_profile_id == biz.id).all()
    services = db.query(Service).filter(Service.business_profile_id == biz.id).all()
    entrepreneur = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()

    shareable_url = f"/b/{biz.share_code}"

    return {
        "id": biz.id,
        "business_name": biz.business_name,
        "category": biz.business_category,
        "description": biz.description,
        "owner_name": current_user.full_name,
        "phone": biz.phone or current_user.phone,
        "email": current_user.email,
        "district": biz.district or (entrepreneur.district if entrepreneur else None),
        "state": biz.state or (entrepreneur.state if entrepreneur else None),
        "village_town": biz.village_town or (entrepreneur.village_town if entrepreneur else None),
        "pincode": biz.pincode,
        "verification_status": biz.verification_status,
        "share_code": biz.share_code,
        "shareable_url": shareable_url,
        "products": products,
        "services": services
    }


@router.get("/public/{share_code}")
def get_public_digital_card(share_code: str, db: Session = Depends(get_db)):
    biz = db.query(BusinessProfile).filter(BusinessProfile.share_code == share_code).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Digital business card not found")

    products = db.query(Product).filter(Product.business_profile_id == biz.id, Product.in_stock == True).all()
    services = db.query(Service).filter(Service.business_profile_id == biz.id, Service.is_available == True).all()
    owner = db.query(User).filter(User.id == biz.user_id).first()

    return {
        "id": biz.id,
        "business_name": biz.business_name or "Rural Enterprise",
        "category": biz.business_category,
        "description": biz.description,
        "owner_name": owner.full_name if owner else "Entrepreneur",
        "phone": biz.phone or (owner.phone if owner else None),
        "email": owner.email if owner else None,
        "location": f"{biz.village_town or ''}, {biz.district or ''}, {biz.state or ''}".strip(", "),
        "verification_status": biz.verification_status,
        "delivery_available": biz.delivery_available,
        "pickup_available": biz.pickup_available,
        "share_code": biz.share_code,
        "products": products,
        "services": services
    }
