import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.session import get_db
from app.models.user import User
from app.models.business import BusinessProfile, BusinessPlan
from app.schemas.entrepreneur import BusinessAnalysisRequest, BusinessAnalysisOut, BusinessPlanRequest, BusinessPlanOut
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.business_agent import analyze_business, generate_business_plan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/business", tags=["Business AI"])


@router.post("/analyze", response_model=BusinessAnalysisOut)
async def analyze_business_idea(
    data: BusinessAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze business feasibility with AI."""
    try:
        result = await analyze_business(
            business_idea=data.business_idea,
            location=data.location,
            capital=data.capital,
            skills=data.skills,
            resources=data.resources or "",
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Business analysis failed: {str(e)}")

    # Save to business profile
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=current_user.id)
        db.add(profile)
    profile.business_category = data.business_idea.split()[0] if data.business_idea else "General"
    profile.description = data.business_idea
    profile.feasibility_score = result.get("opportunity_score", 0)
    profile.opportunity_score = result.get("opportunity_score", 0)
    profile.strengths = result.get("strengths", [])
    profile.weaknesses = result.get("weaknesses", [])
    profile.risks = result.get("risks", [])
    profile.opportunities = result.get("opportunities", [])
    profile.target_customers = result.get("target_customers", [])
    profile.required_resources = result.get("required_resources", [])
    profile.suggested_next_steps = result.get("suggested_next_steps", [])
    profile.analysis_summary = result.get("analysis_summary", "")
    db.commit()

    # Build execution trace
    execution_trace = {
        "intent": "Business Feasibility Analysis",
        "agents_used": ["Business Agent"],
        "tools_used": ["business_analysis_model"],
        "data_sources": ["SATYA Business Knowledge Base", "Rural India Market Context"],
        "key_inputs": {
            "business_idea": data.business_idea,
            "capital": f"₹{data.capital:,.0f}",
            "location": data.location,
        },
        "result_summary": f"Opportunity Score: {result.get('opportunity_score', 0)}/100",
        "confidence": result.get("confidence", 0.8),
    }

    return BusinessAnalysisOut(
        opportunity_score=result.get("opportunity_score", 65),
        feasibility=result.get("feasibility", "Medium"),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        risks=result.get("risks", []),
        opportunities=result.get("opportunities", []),
        required_resources=result.get("required_resources", []),
        target_customers=result.get("target_customers", []),
        suggested_next_steps=result.get("suggested_next_steps", []),
        analysis_summary=result.get("analysis_summary", ""),
        confidence=result.get("confidence", 0.8),
        is_ai_generated=True,
        execution_trace=execution_trace,
    )


@router.post("/plan/generate")
async def generate_plan(
    data: BusinessPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a complete business plan with AI."""
    try:
        plan_data = await generate_business_plan(
            business_idea=data.business_idea,
            location=data.location,
            capital=data.capital,
            skills=data.skills,
            resources=data.resources or "",
            team_size=data.team_size,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Plan generation failed: {str(e)}")

    # Get or create business profile
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Save plan to DB
    plan = BusinessPlan(
        user_id=current_user.id,
        business_profile_id=profile.id,
        title=plan_data.get("title", "My Business Plan"),
        executive_summary=plan_data.get("executive_summary", ""),
        business_objective=plan_data.get("business_objective", ""),
        products_services=plan_data.get("products_services", ""),
        target_market=plan_data.get("target_market", ""),
        customer_segments=plan_data.get("customer_segments", ""),
        resource_requirements=plan_data.get("resource_requirements", {}),
        operations_plan=plan_data.get("operations_plan", ""),
        marketing_plan=plan_data.get("marketing_plan", ""),
        financial_requirements=plan_data.get("financial_requirements", {}),
        risk_assessment=plan_data.get("risk_assessment", []),
        action_plan_30=plan_data.get("action_plan_30", []),
        action_plan_60=plan_data.get("action_plan_60", []),
        action_plan_90=plan_data.get("action_plan_90", []),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    plan_data["id"] = plan.id
    plan_data["is_ai_generated"] = True
    return plan_data


@router.get("/plans")
def get_business_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plans = (
        db.query(BusinessPlan)
        .filter(BusinessPlan.user_id == current_user.id)
        .order_by(BusinessPlan.created_at.desc())
        .all()
    )
    return [{"id": p.id, "title": p.title, "created_at": p.created_at, "version": p.version} for p in plans]


@router.get("/plans/{plan_id}")
def get_business_plan(plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = db.query(BusinessPlan).filter(BusinessPlan.id == plan_id, BusinessPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.get("/profile")
def get_business_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No business profile found")
    return profile


@router.get("/next-steps")
def get_next_steps_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamic 'What Should I Do Next?' action roadmap for entrepreneurs & farmers."""
    b_profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    plan = db.query(BusinessPlan).filter(BusinessPlan.user_id == current_user.id).first()

    readiness = 65
    steps = []

    if not b_profile:
        steps.append({"step": 1, "action": "Complete Business & Profile setup", "route": "/profile", "status": "pending"})
    else:
        readiness += 10
        steps.append({"step": 1, "action": "Complete Business & Profile setup", "route": "/profile", "status": "completed"})

    if not plan:
        steps.append({"step": 2, "action": "Generate 10-section SATYA Business Plan", "route": "/business", "status": "pending"})
    else:
        readiness += 15
        steps.append({"step": 2, "action": "Generate 10-section SATYA Business Plan", "route": "/business", "status": "completed"})

    steps.extend([
        {"step": 3, "action": "Calculate Funding Gap & SATYA AI Loan Readiness", "route": "/funding-gap", "status": "pending"},
        {"step": 4, "action": "Check Verified Government Schemes & Compare Loans", "route": "/schemes", "status": "pending"},
        {"step": 5, "action": "Prepare Application Package & Document Checklist", "route": "/funding-gap", "status": "pending"},
        {"step": 6, "action": "List Products & Connect with Local Buyers", "route": "/products", "status": "pending"}
    ])

    return {
        "readiness_score": min(100, readiness),
        "user_role": current_user.role,
        "next_steps": steps
    }
