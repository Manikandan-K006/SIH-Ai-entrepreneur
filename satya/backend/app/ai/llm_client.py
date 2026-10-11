"""
SATYA AI Orchestration Layer
Central router that classifies intent and dispatches to specialized agents.
"""
import json
import time
import logging
from typing import Optional, Any, Dict
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
_client: Optional[AsyncOpenAI] = None

def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set. Please configure it in your .env file.")
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 2000,
    response_format: dict | None = None,
) -> tuple[str, int]:
    """
    Single point of contact for OpenAI chat completions.
    Returns (content, tokens_used).
    """
    client = get_openai_client()
    kwargs = {
        "model": model or settings.OPENAI_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        kwargs["response_format"] = response_format

    response = await client.chat.completions.create(**kwargs)
    content = response.choices[0].message.content or ""
    tokens = response.usage.total_tokens if response.usage else 0
    return content, tokens


async def generate_structured_output(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 2000,
) -> Dict[str, Any]:
    """
    Generate JSON structured output using chat_completion with json_object response format.
    Returns parsed dictionary or {'error': ...} if failed.
    """
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        content, _ = await chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        return json.loads(content)
    except Exception as e:
        logger.error(f"Structured output generation failed: {e}")
        return {"error": str(e)}


async def get_embedding(text: str) -> list[float]:
    """Get text embedding for RAG."""
    client = get_openai_client()
    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text[:8000],  # truncate to model limit
    )
    return response.data[0].embedding

