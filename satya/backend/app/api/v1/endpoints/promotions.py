# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.business import BusinessProfile, Product
from app.models.promotion import PromotionCampaign
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/promotions", tags=["Paid Promotions"])


class PromotionCreate(BaseModel):
    product_id: Optional[int] = None
    tier: str = "sponsored_listing" # featured_business, sponsored_listing, local_promotion, festival_promotion
    headline: str
    description: Optional[str] = None
    target_district: Optional[str] = None
    target_category: Optional[str] = None
    budget: float = 500.0
    duration_days: int = 7


@router.post("/campaigns")
def create_promotion(
    data: PromotionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business profile required to launch promotions")

    campaign = PromotionCampaign(
        business_profile_id=biz.id,
        product_id=data.product_id,
        tier=data.tier,
        headline=data.headline,
        description=data.description,
        target_district=data.target_district or biz.district,
        target_category=data.target_category or biz.business_category,
        budget=data.budget,
        duration_days=data.duration_days,
        status="active",
        payment_status="mock_success",
        payment_provider="mock_upi"
    )
    db.add(campaign)

    # Mark product as promoted if product_id is specified
    if data.product_id:
        p = db.query(Product).filter(Product.id == data.product_id, Product.business_profile_id == biz.id).first()
        if p:
            p.is_promoted = True

    db.commit()
    db.refresh(campaign)

    return {
        "id": campaign.id,
        "status": campaign.status,
        "badge_label": "Sponsored",
        "message": f"Promotion campaign '{campaign.headline}' launched successfully (Mock Payment Verified)."
    }


@router.get("/campaigns")
def list_my_promotions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not biz:
        return []
    campaigns = db.query(PromotionCampaign).filter(PromotionCampaign.business_profile_id == biz.id).all()
    return campaigns


@router.get("/active")
def get_active_promotions(
    category: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(PromotionCampaign).filter(PromotionCampaign.status == "active")
    if category:
        q = q.filter(PromotionCampaign.target_category == category)
    if district:
        q = q.filter(PromotionCampaign.target_district == district)
    promos = q.limit(10).all()

    results = []
    for p in promos:
        b = p.business_profile
        results.append({
            "id": p.id,
            "headline": p.headline,
            "description": p.description,
            "badge_label": "Sponsored",
            "tier": p.tier,
            "business_id": b.id,
            "business_name": b.business_name,
            "district": b.district,
            "phone": b.phone,
            "share_code": b.share_code
        })
    return results
