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


# ---------------------------------------------------------------------------
# Option 3: Android Phone SIM Gateway Webhook (100% Free Hardware Telephony)
# Compatible with MacroDroid, Automate, Tasker, or Python on Android.
# ---------------------------------------------------------------------------

class AndroidGatewayCallInput(BaseModel):
    caller_number: str
    call_type: str = "missed_call"  # missed_call or incoming
    language: str = "ta"            # ta, hi, en


class AndroidGatewaySMSInput(BaseModel):
    sender_number: str
    message_text: str
    language: str = "ta"            # ta, hi, en


@router.post("/android-gateway/call")
async def android_gateway_call(data: AndroidGatewayCallInput, db: Session = Depends(get_db)):
    """
    Called by an Android automation app (e.g. MacroDroid) on your spare phone.
    When a caller dials your Indian SIM number, the app detects the call,
    triggers this webhook, and automatically replies via SIM SMS at zero extra cost.
    """
    from app.models.user import User
    from app.models.business import BusinessProfile

    session_id = str(uuid.uuid4())
    
    # Check if this phone number is registered with an entrepreneur
    clean_num = data.caller_number.replace(" ", "").replace("-", "")
    last_10 = clean_num[-10:] if len(clean_num) >= 10 else clean_num
    
    user = (
        db.query(User)
        .filter(User.phone.like(f"%{last_10}%"))
        .first()
    ) if last_10 else None
    
    biz = None
    if user:
        biz = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()

    # Generate custom advice
    if data.language == "ta":
        if user and biz and biz.business_name:
            sms_text = (
                f"வணக்கம் {user.full_name}! உங்கள் '{biz.business_name}' தொழிலுக்கு "
                f"முத்ரா (MUDRA) கடன் ₹10 லட்சம் வரையிலும், PM-FME 35% மூலதன மானியமும் பெறலாம். "
                f"சாத்யா வழிகாட்டல் அறிக்கை தயாராக உள்ளது: http://satya.ai"
            )
        else:
            sms_text = (
                "வணக்கம்! சாத்யா (SATYA) AI ஆலோசனைக்கு நன்றி. "
                "சிறு தொழில்களுக்கு முத்ரா (MUDRA) கடன் ₹50,000 முதல் ₹10 லட்சம் வரை பிணையின்றி பெறலாம். "
                "உணவு பதப்படுத்துதலுக்கு PM-FME 35% மானியம் உண்டு. விவரங்களுக்கு: http://satya.ai"
            )
    elif data.language == "hi":
        if user and biz and biz.business_name:
            sms_text = (
                f"नमस्ते {user.full_name}! आपके '{biz.business_name}' व्यवसाय के लिए "
                f"मुद्रा योजना (PMMY) ₹10 लाख तक और 35% सब्सिडी उपलब्ध है। "
                f"विस्तृत योजना के लिए देखें: http://satya.ai"
            )
        else:
            sms_text = (
                "नमस्ते! सत्या (SATYA) AI हेल्पलाइन में आपका स्वागत है। "
                "मुद्रा योजना (PMMY) के तहत बिना गारंटी ₹10 लाख तक का ऋण उपलब्ध है। "
                "अधिक जानकारी के लिए अपनी नजदीकी बैंक शाखा या http://satya.ai से संपर्क करें।"
            )
    else:
        if user and biz and biz.business_name:
            sms_text = (
                f"Hello {user.full_name}! For your '{biz.business_name}' enterprise, "
                f"MUDRA collateral-free loans up to Rs. 10 Lakhs and PM-FME 35% subsidy are available. "
                f"View details at http://satya.ai"
            )
        else:
            sms_text = (
                "Hello! Thank you for contacting SATYA AI Helpline. "
                "You are eligible for MUDRA collateral-free loans up to Rs. 10 Lakhs and PM-FME 35% subsidies. "
                "Visit your nearest bank, DIC, or http://satya.ai for instant guidance."
            )

    sess = VoiceSession(
        session_id=session_id,
        user_id=user.id if user else None,
        caller_number=data.caller_number,
        language=data.language,
        speech_transcript=f"Missed Call Received ({data.call_type})",
        ai_response_text=sms_text,
        channel="android_sim_gateway",
        status="completed"
    )
    db.add(sess)
    db.commit()

    return {
        "status": "success",
        "caller_number": data.caller_number,
        "caller_name": user.full_name if user else "New Caller",
        "action": "send_sms",
        "sms_text": sms_text,
        "session_id": session_id,
    }


@router.post("/android-gateway/sms-inbound")
async def android_gateway_sms_inbound(data: AndroidGatewaySMSInput, db: Session = Depends(get_db)):
    """
    Called when an entrepreneur sends a text message/SMS to your Android Phone SIM.
    Routes the query to SATYA NLP Core and returns tailored SMS advice for auto-reply.
    """
    from app.ai.agent_router import generate_satya_response

    session_id = str(uuid.uuid4())

    # Get AI response via SATYA NLP core
    ai_response, _ = await generate_satya_response(
        query=data.message_text,
        conversation_history=[],
        user_context={"phone": data.sender_number, "channel": "sms_inbound"},
        language=data.language,
    )

    # Format concise SMS (trim if overly long)
    reply_sms = ai_response[:320] if len(ai_response) > 320 else ai_response

    sess = VoiceSession(
        session_id=session_id,
        caller_number=data.sender_number,
        language=data.language,
        speech_transcript=data.message_text,
        ai_response_text=reply_sms,
        channel="android_sim_gateway_sms",
        status="completed"
    )
    db.add(sess)
    db.commit()

    return {
        "status": "success",
        "sender_number": data.sender_number,
        "incoming_query": data.message_text,
        "action": "send_sms",
        "reply_sms": reply_sms,
        "session_id": session_id,
    }


@router.get("/android-gateway/logs")
def get_android_gateway_logs(db: Session = Depends(get_db)):
    """Get recent activity logs from the Android SIM Gateway."""
    sessions = (
        db.query(VoiceSession)
        .filter(VoiceSession.channel.like("android_sim_gateway%"))
        .order_by(VoiceSession.created_at.desc())
        .limit(25)
        .all()
    )
    return [
        {
            "session_id": s.session_id,
            "caller_number": s.caller_number,
            "channel": s.channel,
            "language": s.language,
            "inquiry": s.speech_transcript,
            "response": s.ai_response_text,
            "status": s.status,
            "timestamp": s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else None,
        }
        for s in sessions
    ]


