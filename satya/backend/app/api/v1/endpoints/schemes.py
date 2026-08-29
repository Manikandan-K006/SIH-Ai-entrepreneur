from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.scheme import GovernmentScheme
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agents.scheme_agent import search_schemes_rag, keyword_search_schemes

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get("/search")
async def search_government_schemes(
    query: str = Query(..., min_length=3),
    business_category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    use_rag: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """RAG-powered government scheme search with source citations."""
    if use_rag:
        result = await search_schemes_rag(query, db, business_category, state)
    else:
        result = await keyword_search_schemes(query, db, business_category, state)
    return result


@router.get("/list")
def list_schemes(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True)
    if state:
        q = q.filter((GovernmentScheme.state == state) | (GovernmentScheme.scheme_type == "Central"))
    if category:
        q = q.filter(GovernmentScheme.business_categories.contains([category]))
    schemes = q.offset(skip).limit(limit).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "ministry": s.ministry,
            "scheme_type": s.scheme_type,
            "description": s.description,
            "benefits": s.benefits,
            "eligibility": s.eligibility,
            "official_url": s.official_url,
            "last_verified_at": s.last_verified_at,
            "is_demo": s.is_demo,
            "required_documents": s.required_documents,
            "application_process": s.application_process,
            "max_subsidy_amount": s.max_subsidy_amount,
            "max_loan_amount": s.max_loan_amount,
        }
        for s in schemes
    ]


@router.get("/{scheme_id}")
def get_scheme(scheme_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scheme = db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()
    if not scheme:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme
