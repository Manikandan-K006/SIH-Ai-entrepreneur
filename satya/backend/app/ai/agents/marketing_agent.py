# pyrefly: ignore [missing-import]
import json
import logging
from typing import Dict, Any, Optional
from app.ai.llm_client import generate_structured_output

logger = logging.getLogger(__name__)

MARKETING_PROMPT = """
You are SATYA AI's Rural Marketing Specialist.
Generate a multilingual, multi-channel marketing campaign tailored for a rural micro-entrepreneur.

Input details provided:
- Product/Business: {product_or_business}
- Target Location: {location}
- Budget: ₹{budget}
- Target Audience / Customer Segment: {target_audience}

Rules:
1. Ads must be clear, compelling, culturally resonant for rural and semi-urban Indian markets.
2. Provide exact text for:
   - English Ad
   - Tamil Ad (in Tamil script)
   - Hindi Ad (in Devanagari script)
   - WhatsApp promotional message with emojis & call-to-action
   - Social Media Caption (Instagram/Facebook)
   - Poster text content (headline, subheadline, key benefits, call to action)
   - 15-second Voice Advertisement script (for local radio/WhatsApp audio)
3. Provide strategic campaign tips: best promotion channels, recommended duration, and expected response.

Return valid JSON in this exact structure:
{
  "campaign_title": "...",
  "english_ad": "...",
  "tamil_ad": "...",
  "hindi_ad": "...",
  "whatsapp_message": "...",
  "social_media_caption": "...",
  "poster_content": {
    "headline": "...",
    "subheadline": "...",
    "key_benefits": ["...", "..."],
    "call_to_action": "..."
  },
  "voice_script": "...",
  "campaign_recommendation": {
    "best_channels": ["WhatsApp", "Local Posters", "Word of Mouth"],
    "suggested_duration": "7 days",
    "budget_allocation": "₹300 poster printing, ₹200 local WhatsApp broadcasts",
    "expected_impact": "High local visibility within 5-10 km radius"
  }
}
"""


async def generate_marketing_campaign(
    product_or_business: str,
    location: str = "Tamil Nadu",
    budget: float = 500.0,
    target_audience: str = "Local villagers and nearby town residents",
    language: str = "en"
) -> Dict[str, Any]:
    formatted_system = MARKETING_PROMPT.format(
        product_or_business=product_or_business,
        location=location,
        budget=budget,
        target_audience=target_audience
    )

    user_prompt = f"Generate marketing materials for '{product_or_business}' in {location} with budget ₹{budget}."

    result = await generate_structured_output(
        system_prompt=formatted_system,
        user_prompt=user_prompt,
        temperature=0.7
    )

    if "error" in result:
        # Fallback marketing copy
        return {
            "campaign_title": f"Promotion for {product_or_business}",
            "english_ad": f"Fresh, quality {product_or_business} available in {location}! Contact us today for best prices.",
            "tamil_ad": f"{location}-யில் தரமான {product_or_business} நியாயமான விலையில் கிடைக்கும். இன்றே தொடர்புகொள்ளுங்கள்!",
            "hindi_ad": f"{location} में ताज़ा और उत्तम गुणवत्ता वाला {product_or_business} उचित दामों पर उपलब्ध है। आज ही संपर्क करें!",
            "whatsapp_message": f"🌾 *சிறப்பு அறிவிப்பு / Special Announcement* 🌾\n\nதரமான {product_or_business} இப்போது {location}-யில் கிடைக்கிறது!\n\n📞 தொடர்புக்கு அழைக்கவும் / Call now!",
            "social_media_caption": f"Support local rural micro-entrepreneurs! Fresh {product_or_business} from {location}. #SATYA #RuralEntrepreneurs #MakeInIndia",
            "poster_content": {
                "headline": f"Quality {product_or_business}",
                "subheadline": f"Made locally in {location}",
                "key_benefits": ["100% Authentic", "Affordable local pricing", "Direct from producer"],
                "call_to_action": "Visit or Call Today!"
            },
            "voice_script": f"வணக்கம்! {location}-யில் சிறந்த முறையில் தயாரிக்கப்பட்ட {product_or_business} இப்போது உங்களுக்காக సిద్ధமாக உள்ளது. உடனே வாங்குங்கள்!",
            "campaign_recommendation": {
                "best_channels": ["WhatsApp Group Sharing", "Local Poster Display"],
                "suggested_duration": "7 Days",
                "budget_allocation": f"₹{budget:.0f} local distribution",
                "expected_impact": "Direct customer inquiries from village community"
            }
        }

    return result
