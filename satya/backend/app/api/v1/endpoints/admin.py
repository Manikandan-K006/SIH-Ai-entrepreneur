from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.entrepreneur import EntrepreneurProfile
from app.models.business import BusinessProfile, BusinessPlan
from app.models.financial import FinancialPlan
from app.models.network import Mentor, Supplier, Buyer
from app.models.ai_log import AIConversation, AIExecutionLog
from app.models.connection import ConnectionRequest, ConnectionStatus
from app.api.v1.endpoints.auth import get_current_user, require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "entrepreneurs": db.query(User).filter(User.role == "entrepreneur").count(),
        "mentors": db.query(Mentor).count(),
        "suppliers": db.query(Supplier).count(),
        "buyers": db.query(Buyer).count(),
        "business_plans_generated": db.query(BusinessPlan).count(),
        "ai_conversations": db.query(AIConversation).count(),
        "connections_made": db.query(ConnectionRequest).filter(ConnectionRequest.status == ConnectionStatus.ACCEPTED).count(),
        "financial_plans": db.query(FinancialPlan).count(),
    }


@router.get("/users")
def list_users(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_demo": u.is_demo,
            "created_at": u.created_at,
            "last_login_at": u.last_login_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}


@router.get("/ai-logs")
def get_ai_logs(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    logs = db.query(AIExecutionLog).order_by(AIExecutionLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
