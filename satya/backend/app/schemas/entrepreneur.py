from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from app.models.entrepreneur import Gender


class EntrepreneurProfileCreate(BaseModel):
    age: Optional[int] = None
    gender: Optional[Gender] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village_town: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_consent: bool = False
    skills: Optional[List[str]] = None
    previous_experience: Optional[str] = None
    education_level: Optional[str] = None
    business_category: Optional[str] = None
    business_idea: Optional[str] = None
    is_existing_business: bool = False
    business_stage: str = "idea"
    available_capital: Optional[float] = None
    expected_investment: Optional[float] = None
    available_resources: Optional[str] = None
    family_members_involved: int = 0
    employees_count: int = 0
    business_goals: Optional[str] = None
    monthly_income_target: Optional[float] = None
    onboarding_completed: bool = False


class EntrepreneurProfileUpdate(EntrepreneurProfileCreate):
    pass


class EntrepreneurProfileOut(EntrepreneurProfileCreate):
    id: int
    user_id: int
    opportunity_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BusinessAnalysisRequest(BaseModel):
    business_idea: str
    location: str
    capital: float
    skills: List[str] = []
    resources: Optional[str] = None
    language: str = "en"


class BusinessAnalysisOut(BaseModel):
    opportunity_score: int
    feasibility: str
    strengths: List[str]
    weaknesses: List[str]
    risks: List[str]
    opportunities: List[str]
    required_resources: List[str]
    target_customers: List[str]
    suggested_next_steps: List[str]
    analysis_summary: str
    confidence: float
    is_ai_generated: bool = True
    execution_trace: Optional[dict] = None


class BusinessPlanRequest(BaseModel):
    business_idea: str
    location: str
    capital: float
    skills: List[str] = []
    resources: Optional[str] = None
    team_size: int = 1
    language: str = "en"


class BusinessPlanOut(BaseModel):
    id: Optional[int] = None
    title: str
    executive_summary: str
    business_objective: str
    products_services: str
    target_market: str
    customer_segments: str
    resource_requirements: dict
    operations_plan: str
    marketing_plan: str
    financial_requirements: dict
    risk_assessment: List[dict]
    action_plan_30: List[str]
    action_plan_60: List[str]
    action_plan_90: List[str]
    is_ai_generated: bool = True

    model_config = {"from_attributes": True}
