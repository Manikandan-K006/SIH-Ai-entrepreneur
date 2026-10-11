# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request, Response
import uuid
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.services.telephony import telephony_service
from app.models.voice import VoiceSession

router = APIRouter(prefix="/voice", tags=["Voice & IVR Helpline"])


class IVRInitInput(BaseModel):
    caller_number: str = ""


class DTMFInput(BaseModel):
    session_id: str
    key_pressed: str # 1=Tamil, 2=Hindi, 3=English


class SpeechInput(BaseModel):
    session_id: str
    speech_text: str
    language: str = "ta"


class MissedCallInput(BaseModel):
    caller_number: str = ""


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


# ---------------------------------------------------------------------------
# Live Telephony Webhooks (Twilio / Exotel / Carrier Gateway)
# Configure these endpoints as the Webhook URL in your Twilio/Exotel Phone Number console.
# ---------------------------------------------------------------------------

@router.post("/twilio/incoming")
async def twilio_incoming_call(request: Request, db: Session = Depends(get_db)):
    """
    Webhook triggered when a mobile caller dials your real helpline number.
    Returns TwiML IVR prompt offering Tamil, Hindi, and English options.
    """
    form = await request.form()
    caller = str(form.get("From", "Unknown"))
    call_sid = str(form.get("CallSid", str(uuid.uuid4())))

    # Record voice session
    session = VoiceSession(
        session_id=call_sid,
        caller_number=caller,
        language="ta",
        channel="twilio_cellular",
        status="initiating"
    )
    db.add(session)
    db.commit()

    twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/v1/voice/twilio/dtmf" method="POST" timeout="8">
        <Say language="en-IN">Welcome to SATYA AI Voice Helpline for rural entrepreneurs.</Say>
        <Say language="ta-IN">தமிழுக்கு எண் 1-ஐ அழுத்தவும்.</Say>
        <Say language="hi-IN">हिंदी के लिए 2 दबाएं।</Say>
        <Say language="en-IN">Press 3 for English.</Say>
    </Gather>
    <Redirect>/api/v1/voice/twilio/incoming</Redirect>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/twilio/dtmf")
async def twilio_dtmf_choice(request: Request, db: Session = Depends(get_db)):
    """
    Handles caller keypad press (1=Tamil, 2=Hindi, 3=English).
    Triggers Speech-To-Text Gather to capture caller's spoken question over phone.
    """
    form = await request.form()
    digits = str(form.get("Digits", "1"))
    call_sid = str(form.get("CallSid", ""))

    lang_map = {"1": "ta", "2": "hi", "3": "en"}
    language = lang_map.get(digits, "en")

    sess = db.query(VoiceSession).filter(VoiceSession.session_id == call_sid).first()
    if sess:
        sess.dtmf_choice = digits
        sess.language = language
        sess.status = "awaiting_speech"
        db.commit()

    if language == "ta":
        say_lang = "ta-IN"
        prompt = "வணக்கம். உங்கள் தொழில் அல்லது நிதி பற்றிய கேள்வியைக் கூறுங்கள்."
    elif language == "hi":
        say_lang = "hi-IN"
        prompt = "नमस्ते। अपने व्यवसाय, ऋण या सरकारी योजना के बारे में पूछें।"
    else:
        say_lang = "en-IN"
        prompt = "Welcome. Please speak your business or scheme question after the tone."

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{say_lang}">{prompt}</Say>
    <Gather input="speech" language="{say_lang}" action="/api/v1/voice/twilio/speech?lang={language}" method="POST" speechTimeout="auto" timeout="8">
    </Gather>
    <Say language="{say_lang}">No speech was detected. Goodbye.</Say>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/twilio/speech")
async def twilio_process_speech(request: Request, lang: str = "en", db: Session = Depends(get_db)):
    """
    Receives transcribed speech from mobile caller, processes it through SATYA NLP core,
    and speaks back the AI response over the cellular phone connection.
    """
    form = await request.form()
    speech_result = str(form.get("SpeechResult", "")).strip()
    call_sid = str(form.get("CallSid", ""))

    say_lang = "ta-IN" if lang == "ta" else ("hi-IN" if lang == "hi" else "en-IN")

    if not speech_result:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{say_lang}">We could not hear your question clearly. Please call again.</Say>
</Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Route question to SATYA NLP Agent Router
    from app.ai.agent_router import generate_satya_response
    ai_answer, _ = await generate_satya_response(
        query=speech_result,
        conversation_history=[],
        user_context={"name": "Cellular Helpline Caller", "role": "entrepreneur"},
        language=lang
    )

    # Sanitize XML entities for TwiML
    safe_answer = (
        ai_answer.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

    # Update session in DB
    sess = db.query(VoiceSession).filter(VoiceSession.session_id == call_sid).first()
    if sess:
        sess.speech_transcript = speech_result
        sess.ai_response_text = ai_answer
        sess.status = "completed"
        db.commit()

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{say_lang}">{safe_answer}</Say>
    <Pause length="1"/>
    <Gather input="speech" language="{say_lang}" action="/api/v1/voice/twilio/speech?lang={lang}" method="POST" speechTimeout="auto" timeout="8">
        <Say language="{say_lang}">Do you have another question? Please speak now.</Say>
    </Gather>
    <Say language="{say_lang}">Thank you for calling SATYA. Have a successful business!</Say>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/twilio/missed-call")
async def twilio_missed_call(request: Request):
    """
    Zero-cost missed call helpline endpoint.
    Drops the call immediately so it costs ₹0 to caller, then schedules callback.
    """
    form = await request.form()
    caller = str(form.get("From", "Unknown"))
    
    twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Reject reason="busy"/>
</Response>"""
    await telephony_service.handle_missed_call(caller)
    return Response(content=twiml, media_type="application/xml")
