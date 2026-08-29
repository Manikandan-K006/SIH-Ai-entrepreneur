from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.network import Mentor, Supplier, Buyer, Organization
from app.models.entrepreneur import EntrepreneurProfile
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.market_agent import analyze_local_market, get_people_matches
from app.models.market import MarketData

router = APIRouter(prefix="/network", tags=["People Network"])


# ── Mentors ────────────────────────────────────────────────────────────────
@router.get("/mentors")
def list_mentors(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Mentor).filter(Mentor.is_active == True)
    if state:
        q = q.filter(Mentor.state == state)
    mentors = q.offset(skip).limit(limit).all()
    return mentors


@router.get("/mentors/{mentor_id}")
def get_mentor(mentor_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    m = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return m


# ── Suppliers ──────────────────────────────────────────────────────────────
@router.get("/suppliers")
def list_suppliers(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Supplier).filter(Supplier.is_active == True)
    if category:
        q = q.filter(Supplier.category == category)
    if state:
        q = q.filter(Supplier.state == state)
    return q.offset(skip).limit(limit).all()


# ── Buyers ─────────────────────────────────────────────────────────────────
@router.get("/buyers")
def list_buyers(
    state: Optional[str] = Query(None),
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Buyer).filter(Buyer.is_active == True)
    if state:
        q = q.filter(Buyer.state == state)
    return q.offset(skip).limit(limit).all()


# ── Organizations ──────────────────────────────────────────────────────────
@router.get("/organizations")
def list_organizations(
    state: Optional[str] = Query(None),
    org_type: Optional[str] = Query(None),
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Organization)
    if state:
        q = q.filter(Organization.state == state)
    if org_type:
        q = q.filter(Organization.org_type == org_type)
    return q.offset(skip).limit(limit).all()


# ── AI Matching ────────────────────────────────────────────────────────────
@router.get("/matches")
def get_ai_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI-powered people matching based on entrepreneur profile."""
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Complete your profile first to get matches")

    ep_dict = {
        "business_category": profile.business_category,
        "state": profile.state,
        "district": profile.district,
        "skills": profile.skills or [],
    }

    mentors = db.query(Mentor).filter(Mentor.is_active == True).all()
    suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    buyers = db.query(Buyer).filter(Buyer.is_active == True).all()

    return get_people_matches(ep_dict, mentors, suppliers, buyers)


# ── Market Analysis ────────────────────────────────────────────────────────
@router.get("/market")
async def get_market_analysis(
    state: str = Query(...),
    district: str = Query(...),
    business_category: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hyper-local market analysis for a given location and business category."""
    return await analyze_local_market(state, district, business_category, db)
