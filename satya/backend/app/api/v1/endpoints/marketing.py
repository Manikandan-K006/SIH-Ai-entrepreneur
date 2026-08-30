from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.business import BusinessProfile
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.marketing_agent import generate_marketing_campaign

router = APIRouter(prefix="/marketing", tags=["AI Marketing Assistant"])


class MarketingRequest(BaseModel):
    product_or_business: str
    location: str = "Tamil Nadu"
    budget: float = 500.0
    target_audience: str = "Local villagers and nearby town residents"
    language: str = "en"


@router.post("/generate")
async def create_marketing_campaign(
    data: MarketingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate multilingual ad copy, WhatsApp text, poster format & voice scripts."""
    try:
        campaign = await generate_marketing_campaign(
            product_or_business=data.product_or_business,
            location=data.location,
            budget=data.budget,
            target_audience=data.target_audience,
            language=data.language
        )
        return campaign
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate marketing campaign: {str(e)}")
