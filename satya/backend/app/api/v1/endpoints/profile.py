from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.entrepreneur import EntrepreneurProfile
from app.schemas.entrepreneur import EntrepreneurProfileCreate, EntrepreneurProfileUpdate, EntrepreneurProfileOut
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("/entrepreneur", response_model=EntrepreneurProfileOut)
def get_entrepreneur_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/entrepreneur", response_model=EntrepreneurProfileOut)
def create_entrepreneur_profile(
    data: EntrepreneurProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if profile:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(profile, field, value)
    else:
        profile = EntrepreneurProfile(user_id=current_user.id, **data.model_dump(exclude_none=True))
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/entrepreneur", response_model=EntrepreneurProfileOut)
def update_entrepreneur_profile(
    data: EntrepreneurProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found — create it first")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
