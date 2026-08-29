from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.financial import FinancialPlan
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.financial_agent import compute_financial_plan

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


@router.post("/calculate")
def calculate_financial_plan(
    data: FinancialPlanInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate financial plan — pure deterministic math, no AI hallucination."""
    result = compute_financial_plan(data.model_dump())

    # Save to DB
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
