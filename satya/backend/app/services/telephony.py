import abc
import uuid
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class TelephonyProvider(abc.ABC):
    """Abstract Telephony Provider Interface (Exotel, Twilio, Knowlarity, Mock)."""

    @abc.abstractmethod
    async def initiate_ivr(self, caller_number: str) -> Dict[str, Any]:
        """Start IVR session with language selection options."""
        pass

    @abc.abstractmethod
    async def process_dtmf(self, session_id: str, key_pressed: str) -> Dict[str, Any]:
        """Process IVR keypress (1=Tamil, 2=Hindi, 3=English)."""
        pass

    @abc.abstractmethod
    async def process_speech_input(self, session_id: str, speech_text: str, language: str) -> Dict[str, Any]:
        """Process STT input text and generate SATYA AI response + TTS instructions."""
        pass

    @abc.abstractmethod
    async def handle_missed_call(self, caller_number: str) -> Dict[str, Any]:
        """Schedule automated callback for missed call."""
        pass

    @abc.abstractmethod
    async def send_sms_fallback(self, phone: str, text: str) -> Dict[str, Any]:
        """Send SMS fallback notification."""
        pass


class MockTelephonyProvider(TelephonyProvider):
    """Mock Telephony Provider for local prototype testing."""

    def __init__(self):
        self.provider_name = "SATYA Mock Voice Engine (Exotel/Twilio Compatible)"

    async def initiate_ivr(self, caller_number: str) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        greeting = {
            "session_id": session_id,
            "prompt": "Welcome to SATYA AI Voice Helpline. Press 1 for Tamil. Press 2 for Hindi. Press 3 for English.",
            "prompt_tamil": "சாத்யா AI குரல் உதவிக்கு நல்வரவு. தமிழுக்கு 1 அழுத்தவும்.",
            "prompt_hindi": "सत्या AI वॉयस हेल्पलाइन में आपका स्वागत है। हिंदी के लिए 2 दबाएं।",
            "prompt_english": "Press 3 for English.",
            "status": "awaiting_dtmf"
        }
        return greeting

    async def process_dtmf(self, session_id: str, key_pressed: str) -> Dict[str, Any]:
        lang_map = {"1": "ta", "2": "hi", "3": "en"}
        lang_name_map = {"ta": "Tamil", "hi": "Hindi", "en": "English"}
        language = lang_map.get(key_pressed, "en")

        prompts = {
            "ta": "நன்றி. உங்கள் தொழில் அல்லது நிதி பற்றிய கேள்വியைக் கூறுங்கள்.",
            "hi": "धन्यवाद। अपने व्यवसाय या वित्तीय प्रश्न पूछें।",
            "en": "Thank you. Please ask your business or financial question."
        }

        return {
            "session_id": session_id,
            "language": language,
            "language_name": lang_name_map[language],
            "prompt": prompts[language],
            "status": "awaiting_speech"
        }

    async def process_speech_input(self, session_id: str, speech_text: str, language: str) -> Dict[str, Any]:
        from app.ai.agent_router import generate_satya_response

        # Route query to SATYA AI Core
        response_text, _ = await generate_satya_response(
            query=speech_text,
            conversation_history=[],
            user_context={"name": "Voice User", "role": "entrepreneur"},
            language=language
        )

        return {
            "session_id": session_id,
            "speech_received": speech_text,
            "language": language,
            "ai_response": response_text,
            "tts_audio_simulated": True,
            "status": "completed"
        }

    async def handle_missed_call(self, caller_number: str) -> Dict[str, Any]:
        return {
            "caller_number": caller_number,
            "callback_status": "scheduled",
            "scheduled_time": "Immediate (Mock 30s delay)",
            "message": f"Missed call received from {caller_number}. SATYA AI voice bot will trigger automated callback."
        }

    async def send_sms_fallback(self, phone: str, text: str) -> Dict[str, Any]:
        return {
            "phone": phone,
            "text": text,
            "status": "sent",
            "provider": self.provider_name
        }


# Singleton telephony provider instance
telephony_service = MockTelephonyProvider()
