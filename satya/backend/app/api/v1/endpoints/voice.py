# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.services.telephony import telephony_service
from app.models.voice import VoiceSession

router = APIRouter(prefix="/voice", tags=["Voice & IVR Helpline"])


class IVRInitInput(BaseModel):
    caller_number: str = "+919876543210"


class DTMFInput(BaseModel):
    session_id: str
    key_pressed: str # 1=Tamil, 2=Hindi, 3=English


class SpeechInput(BaseModel):
    session_id: str
    speech_text: str
    language: str = "ta"


class MissedCallInput(BaseModel):
    caller_number: str = "+919876543210"


@router.post("/ivr-start")
async def start_ivr_session(data: IVRInitInput, db: Session = Depends(get_db)):
    result = await telephony_service.initiate_ivr(data.caller_number)
    
    # Save voice session record
    session = VoiceSession(
        session_id=result["session_id"],
        caller_number=data.caller_number,
        language="ta",
        channel="ivr",
        status="initiating"
    )
    db.add(session)
    db.commit()

    return result


@router.post("/dtmf")
async def process_dtmf_choice(data: DTMFInput, db: Session = Depends(get_db)):
    result = await telephony_service.process_dtmf(data.session_id, data.key_pressed)
    
    sess = db.query(VoiceSession).filter(VoiceSession.session_id == data.session_id).first()
    if sess:
        sess.dtmf_choice = data.key_pressed
        sess.language = result.get("language", "en")
        sess.status = "awaiting_speech"
        db.commit()

    return result


@router.post("/process-speech")
async def process_voice_speech(data: SpeechInput, db: Session = Depends(get_db)):
    result = await telephony_service.process_speech_input(data.session_id, data.speech_text, data.language)
    
    sess = db.query(VoiceSession).filter(VoiceSession.session_id == data.session_id).first()
    if sess:
        sess.speech_transcript = data.speech_text
        sess.ai_response_text = result.get("ai_response")
        sess.status = "completed"
        db.commit()

    return result


@router.post("/missed-call")
async def register_missed_call(data: MissedCallInput):
    """Missed Call -> Automatic Callback trigger."""
    return await telephony_service.handle_missed_call(data.caller_number)


@router.post("/sms-fallback")
async def send_sms_fallback(phone: str, text: str):
    """SMS fallback notification trigger."""
    return await telephony_service.send_sms_fallback(phone, text)
