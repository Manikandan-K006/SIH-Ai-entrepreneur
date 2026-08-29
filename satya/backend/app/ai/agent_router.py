"""
SATYA Agent Router — Intent classification and agent dispatch.
"""
import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional
from app.ai.llm_client import chat_completion

logger = logging.getLogger(__name__)


class AgentType(str, Enum):
    BUSINESS = "business"
    FINANCIAL = "financial"
    MARKET = "market"
    SCHEME = "scheme"
    PEOPLE = "people"
    DOCUMENT = "document"
    GENERAL = "general"


@dataclass
class ExecutionTrace:
    query: str
    intent: str = ""
    agents_used: list[str] = field(default_factory=list)
    tools_used: list[str] = field(default_factory=list)
    data_sources: list[str] = field(default_factory=list)
    key_inputs: dict = field(default_factory=dict)
    result_summary: str = ""
    confidence_score: float = 0.8
    execution_time_ms: int = 0
    tokens_used: int = 0


INTENT_CLASSIFICATION_PROMPT = """You are SATYA's intent classifier. Classify the user's query into one or more of these intents:

Intents available:
- business_analysis: Business idea validation, feasibility, SWOT
- business_plan: Creating or updating a business plan  
- financial_planning: Financial calculations, break-even, cash flow, EMI, funding
- government_schemes: Government schemes, subsidies, loans, eligibility
- market_analysis: Local market, competition, demand, pricing, suppliers/buyers nearby
- people_network: Finding mentors, suppliers, buyers, SHGs, organizations
- general_advice: General business advice, motivation, how-to questions
- progress_tracking: Tracking business progress, milestones

Respond with JSON only:
{
  "primary_intent": "<intent>",
  "secondary_intents": ["<intent1>", "<intent2>"],
  "agents_needed": ["business", "financial", "market", "scheme", "people"],
  "key_entities": {
    "business_type": "<extracted business type or null>",
    "capital_amount": <number or null>,
    "location": "<extracted location or null>",
    "language": "en"
  },
  "confidence": 0.9
}

User query: {query}
User context: {context}
"""


async def classify_intent(query: str, user_context: dict) -> dict:
    """Classify user query intent and determine which agents to invoke."""
    prompt = INTENT_CLASSIFICATION_PROMPT.format(
        query=query,
        context=json.dumps(user_context, ensure_ascii=False)
    )
    content, tokens = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=500,
        response_format={"type": "json_object"},
    )
    try:
        result = json.loads(content)
        result["tokens"] = tokens
        return result
    except json.JSONDecodeError:
        return {
            "primary_intent": "general_advice",
            "secondary_intents": [],
            "agents_needed": ["general"],
            "key_entities": {},
            "confidence": 0.5,
            "tokens": tokens,
        }


SATYA_SYSTEM_PROMPT = """You are SATYA (Smart AI for Transforming Your Aspirations), an AI business companion for rural micro-entrepreneurs in India.

Your role:
- Help rural entrepreneurs understand business opportunities
- Provide practical, actionable business advice
- Assist with financial planning and calculations
- Help identify government schemes and support
- Connect entrepreneurs with mentors, suppliers, and buyers
- Provide hyper-local market intelligence

Important rules:
1. NEVER fabricate government scheme names, amounts, or eligibility criteria
2. NEVER guarantee loan approval or income projections as certain facts
3. Always label AI-generated estimates clearly
4. For government schemes, always cite your source or say "verify with official source"
5. Be encouraging, practical, and culturally sensitive
6. Use simple language appropriate for rural entrepreneurs
7. Always provide actionable next steps

When you don't have verified information, say: "I'd recommend verifying this with the relevant government office or financial institution."

Current user context:
{user_context}

Retrieved information for this query:
{retrieved_context}
"""


async def generate_satya_response(
    query: str,
    conversation_history: list[dict],
    user_context: dict,
    retrieved_context: str = "",
    language: str = "en",
) -> tuple[str, int]:
    """Generate SATYA's main response with full context."""
    system_prompt = SATYA_SYSTEM_PROMPT.format(
        user_context=json.dumps(user_context, ensure_ascii=False),
        retrieved_context=retrieved_context or "No specific retrieved information for this query.",
    )

    lang_instruction = ""
    if language == "ta":
        lang_instruction = "\n\nIMPORTANT: Respond in Tamil language."
    elif language == "hi":
        lang_instruction = "\n\nIMPORTANT: Respond in Hindi language."

    messages = [
        {"role": "system", "content": system_prompt + lang_instruction},
        *conversation_history[-10:],  # last 10 messages for context
        {"role": "user", "content": query},
    ]

    return await chat_completion(messages=messages, temperature=0.4, max_tokens=1500)
