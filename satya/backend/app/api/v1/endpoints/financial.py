# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.financial import FinancialPlan
from app.models.scheme import GovernmentScheme
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.financial_agent import compute_financial_plan, compute_funding_gap, compute_loan_readiness

router = APIRouter(prefix="/financial", tags=["Financial AI"])


class FinancialPlanInput(BaseModel):
    available_capital: float = 0
    required_investment: float = 0
    equipment_cost: float = 0
    raw_material_cost: float = 0
    labour_cost_monthly: float = 0
    rent_monthly: float = 0
    transport_monthly: float = 0
    other_expenses_monthly: float = 0
    expected_revenue_monthly: float = 0
    loan_amount: float = 0
    loan_interest_rate: float = 7.0
    loan_tenure_months: int = 36
    title: str = "My Financial Plan"


class FundingGapInput(BaseModel):
    project_cost: float
    available_capital: float


class LoanReadinessInput(BaseModel):
    business_idea: Optional[str] = None
    project_cost: float = 0.0
    available_capital: float = 0.0
    monthly_expenses: float = 0.0
    expected_revenue: float = 0.0
    has_identity_doc: bool = True
    has_address_proof: bool = True
    experience_years: float = 2.0


class PrepareApplicationInput(BaseModel):
    business_name: str
    business_type: str
    project_cost: float
    available_capital: float
    monthly_revenue: float
    monthly_expenses: float
    scheme_id: Optional[int] = None


@router.post("/calculate")
def calculate_financial_plan(
    data: FinancialPlanInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate financial plan — pure deterministic math, no AI hallucination."""
    result = compute_financial_plan(data.model_dump())

    plan = FinancialPlan(
        user_id=current_user.id,
        title=data.title,
        available_capital=data.available_capital,
        required_investment=data.required_investment,
        equipment_cost=data.equipment_cost,
        raw_material_cost=data.raw_material_cost,
        labour_cost_monthly=data.labour_cost_monthly,
        rent_monthly=data.rent_monthly,
        transport_monthly=data.transport_monthly,
        other_expenses_monthly=data.other_expenses_monthly,
        expected_revenue_monthly=data.expected_revenue_monthly,
        total_project_cost=result["total_project_cost"],
        own_contribution=result["own_contribution"],
        funding_requirement=result["funding_requirement"],
        total_monthly_expenses=result["total_monthly_expenses"],
        gross_margin_percent=result["gross_margin_percent"],
        break_even_months=result["break_even_months"],
        break_even_revenue=result["break_even_revenue"],
        loan_amount=data.loan_amount,
        loan_interest_rate=data.loan_interest_rate,
        loan_tenure_months=data.loan_tenure_months,
        emi_amount=result["emi_amount"],
        cash_flow_projection=result["cash_flow_projection"],
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    result["plan_id"] = plan.id
    return result


@router.post("/funding-gap")
def calculate_funding_gap_endpoint(data: FundingGapInput):
    """Calculate Funding Gap = Project Cost - Available Capital."""
    return compute_funding_gap(data.project_cost, data.available_capital)


@router.post("/loan-readiness")
def assess_loan_readiness_endpoint(data: LoanReadinessInput):
    """SATYA AI Loan Readiness Assessment (0-100 Score). NOT a bank credit score."""
    return compute_loan_readiness(data.model_dump())


@router.post("/compare-loans")
def compare_verified_loans(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Loan comparison table across verified government & institutional schemes."""
    schemes = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True).limit(10).all()
    
    comparisons = []
    for s in schemes:
        comparisons.append({
            "scheme_id": s.id,
            "scheme_name": s.name,
            "authority": s.ministry or "Government of India",
            "purpose": s.benefits or s.description[:120] if s.description else "Business financing",
            "eligibility_status": "Potentially Relevant — Needs Verification",
            "eligibility_conditions": s.eligibility,
            "funding_range": f"Up to ₹{s.max_loan_amount:,.0f}" if s.max_loan_amount else "Variable subsidy/loan",
            "required_documents": s.required_documents or ["Identity proof", "Address proof", "Project report"],
            "official_source": s.official_url or "Official Portal",
            "last_verified_at": s.last_verified_at,
            "disclaimer": "Verify current eligibility requirements with the official authority/lending institution."
        })

    return comparisons


@router.post("/prepare-application")
def prepare_application_package(data: PrepareApplicationInput, db: Session = Depends(get_db)):
    """Generate downloadable application summary package & document checklist."""
    gap = compute_funding_gap(data.project_cost, data.available_capital)

    scheme = None
    if data.scheme_id:
        scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == data.scheme_id).first()

    document_checklist = scheme.required_documents if (scheme and scheme.required_documents) else [
        "Aadhar Card / Voter ID (Identity Proof)",
        "Ration Card / Utility Bill (Address Proof)",
        "Bank Account Passbook / 6 Months Statement",
        "Project Report / Business Cost Estimate",
        "FSSAI / Local Panchayat Trade License (if applicable)"
    ]

    return {
        "title": f"SATYA Business Application Package — {data.business_name}",
        "business_summary": {
            "business_name": data.business_name,
            "business_type": data.business_type,
            "total_project_cost": f"₹{data.project_cost:,.2f}",
            "own_capital": f"₹{data.available_capital:,.2f}",
            "funding_gap_required": f"₹{gap['funding_gap']:,.2f}",
            "monthly_expected_revenue": f"₹{data.monthly_revenue:,.2f}",
            "monthly_expected_expenses": f"₹{data.monthly_expenses:,.2f}",
        },
        "target_scheme": scheme.name if scheme else "Verified Government MSME Scheme",
        "document_checklist": document_checklist,
        "disclaimer": "SATYA prepares this document for user reference. Final submission and loan approval must be made directly with the relevant financial institution."
    }


@router.get("/plans")
def get_financial_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = (
        db.query(FinancialPlan)
        .filter(FinancialPlan.user_id == current_user.id)
        .order_by(FinancialPlan.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": p.id,
            "title": p.title,
            "total_project_cost": p.total_project_cost,
            "funding_requirement": p.funding_requirement,
            "break_even_months": p.break_even_months,
            "emi_amount": p.emi_amount,
            "created_at": p.created_at,
        }
        for p in plans
    ]


@router.get("/plans/{plan_id}")
def get_financial_plan(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(FinancialPlan).filter(FinancialPlan.id == plan_id, FinancialPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
