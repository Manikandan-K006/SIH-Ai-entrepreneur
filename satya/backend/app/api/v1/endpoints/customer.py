from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.customer import CustomerProfile
from app.models.business import BusinessProfile, Product, Service
from app.models.marketplace import Review
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.customer_search import search_local_businesses_and_products

router = APIRouter(prefix="/customer", tags=["Customer Portal"])


class CustomerProfileCreate(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    village_town: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    preferred_categories: Optional[List[str]] = None


class ReviewCreate(BaseModel):
    business_profile_id: int
    rating: int = 5
    comment: Optional[str] = None


@router.get("/profile")
def get_customer_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        profile = CustomerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/profile")
def update_customer_profile(
    data: CustomerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        profile = CustomerProfile(user_id=current_user.id, **data.model_dump(exclude_none=True))
        db.add(profile)
    else:
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/search/ai")
async def ai_natural_language_search(
    query: str = Query(..., min_length=2),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Natural Language search across products, services, and local businesses without hallucination."""
    return await search_local_businesses_and_products(query, db, location)


@router.post("/reviews")
def add_business_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    biz = db.query(BusinessProfile).filter(BusinessProfile.id == data.business_profile_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business profile not found")

    rev = Review(
        customer_id=current_user.id,
        business_profile_id=data.business_profile_id,
        rating=max(1, min(5, data.rating)),
        comment=data.comment
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return {"message": "Review submitted successfully", "review_id": rev.id}


@router.get("/reviews/{business_id}")
def get_business_reviews(business_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.business_profile_id == business_id,
        Review.is_moderated == True
    ).order_by(Review.created_at.desc()).all()
    return reviews


@router.post("/saved/{business_id}")
def toggle_save_business(
    business_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == current_user.id).first()
    if not profile:
        profile = CustomerProfile(user_id=current_user.id, saved_business_ids=[])
        db.add(profile)
        db.commit()
        db.refresh(profile)

    saved = list(profile.saved_business_ids or [])
    if business_id in saved:
        saved.remove(business_id)
        is_saved = False
    else:
        saved.append(business_id)
        is_saved = True

    profile.saved_business_ids = saved
    db.commit()
    return {"is_saved": is_saved, "saved_business_ids": saved}
