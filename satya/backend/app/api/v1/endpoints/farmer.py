# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.farmer import FarmerProfile, AgriFinancialRecord
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.agri_agent import analyze_agri_business

router = APIRouter(prefix="/farmer", tags=["Farmer & Agri-Entrepreneur Hub"])


class FarmerProfileCreate(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    village_town: Optional[str] = None
    pincode: Optional[str] = None
    agri_activity_type: Optional[str] = None # Dairy, Poultry, Fisheries, Beekeeping, Horticulture, Food Processing, Crop Production, Agri-Trading
    land_size_acres: Optional[float] = 0.0
    irrigation_type: Optional[str] = None
    existing_business_activity: Optional[str] = None
    products: Optional[List[str]] = None
    production_scale: Optional[str] = None
    existing_equipment: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    available_capital: Optional[float] = 0.0
    required_investment: Optional[float] = 0.0
    current_income_monthly: Optional[float] = 0.0
    monthly_expenses: Optional[float] = 0.0
    target_business: Optional[str] = None
    target_customers: Optional[str] = None
    consent_given: bool = True


class AgriFinancialRecordCreate(BaseModel):
    month_year: str # "2026-08"
    sales_revenue: float = 0.0
    input_cost: float = 0.0
    transport_cost: float = 0.0
    labour_cost: float = 0.0
    equipment_cost: float = 0.0
    other_expense: float = 0.0


class AgriAnalyzeRequest(BaseModel):
    business_idea: str
    location: str = "Tamil Nadu"
    capital: float = 50000.0
    required_investment: float = 200000.0
    resources: Optional[str] = ""
    skills: Optional[str] = ""


@router.get("/profile")
def get_farmer_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not profile:
        profile = FarmerProfile(user_id=current_user.id, consent_given=True)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/profile")
def update_farmer_profile(
    data: FarmerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not profile:
        profile = FarmerProfile(user_id=current_user.id, **data.model_dump(exclude_none=True))
        db.add(profile)
    else:
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/analyze")
async def analyze_agri_enterprise(data: AgriAnalyzeRequest):
    """Analyze agri-business feasibility (Dairy, Poultry, Fisheries, Beekeeping, Food Processing)."""
    return await analyze_agri_business(
        business_idea=data.business_idea,
        location=data.location,
        capital=data.capital,
        required_investment=data.required_investment,
        resources=data.resources or "",
        skills=data.skills or ""
    )


@router.post("/financial-records")
def record_agri_financials(
    data: AgriFinancialRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_exp = data.input_cost + data.transport_cost + data.labour_cost + data.equipment_cost + data.other_expense
    net_profit = data.sales_revenue - total_exp

    # AI Trend explanation
    if net_profit > 0:
        ai_summary = f"Net profit of ₹{net_profit:,.2f} recorded for {data.month_year}. Healthy monthly cash flow."
    else:
        ai_summary = f"Net loss of ₹{abs(net_profit):,.2f} for {data.month_year} due to input (₹{data.input_cost:,.2f}) and transport (₹{data.transport_cost:,.2f}) expenses exceeding revenue."

    record = AgriFinancialRecord(
        user_id=current_user.id,
        month_year=data.month_year,
        sales_revenue=data.sales_revenue,
        input_cost=data.input_cost,
        transport_cost=data.transport_cost,
        labour_cost=data.labour_cost,
        equipment_cost=data.equipment_cost,
        other_expense=data.other_expense,
        total_expenses=total_exp,
        net_profit_loss=net_profit,
        ai_analysis_summary=ai_summary
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/financial-records")
def get_agri_financial_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(AgriFinancialRecord).filter(AgriFinancialRecord.user_id == current_user.id).order_by(AgriFinancialRecord.created_at.desc()).all()
    return records
