"""
Scheme Agent — RAG-powered government scheme search with source citations.
"""
import json
import logging
import numpy as np
from typing import Any
from sqlalchemy.orm import Session
from app.ai.llm_client import chat_completion, get_embedding
from app.models.scheme import GovernmentScheme, SchemeEmbedding

logger = logging.getLogger(__name__)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_arr = np.array(a)
    b_arr = np.array(b)
    norm_a = np.linalg.norm(a_arr)
    norm_b = np.linalg.norm(b_arr)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (norm_a * norm_b))


async def search_schemes_rag(
    query: str,
    db: Session,
    business_category: str | None = None,
    state: str | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    """
    RAG-powered scheme search:
    1. Embed query
    2. Find similar chunks via cosine similarity
    3. Retrieve parent schemes
    4. Synthesize with LLM citing sources
    """
    # Step 1: Get query embedding
    try:
        query_embedding = await get_embedding(query)
    except Exception as e:
        logger.warning(f"Embedding failed, falling back to keyword search: {e}")
        return await keyword_search_schemes(query, db, business_category, state)

    # Step 2: Load embeddings from DB and rank
    embeddings = db.query(SchemeEmbedding).all()
    if not embeddings:
        # Fall back to direct scheme search
        return await keyword_search_schemes(query, db, business_category, state)

    scored = []
    for emb in embeddings:
        if emb.embedding_json:
            score = cosine_similarity(query_embedding, emb.embedding_json)
            scored.append((score, emb))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored[:top_k]

    # Step 3: Get unique schemes
    scheme_ids = list(set(chunk.scheme_id for _, chunk in top_chunks))
    schemes = db.query(GovernmentScheme).filter(GovernmentScheme.id.in_(scheme_ids)).all()

    if not schemes:
        return await keyword_search_schemes(query, db, business_category, state)

    # Step 4: Build context for LLM
    context_parts = []
    for score, chunk in top_chunks[:5]:
        scheme = next((s for s in schemes if s.id == chunk.scheme_id), None)
        if scheme:
            context_parts.append(
                f"SCHEME: {scheme.name}\n"
                f"Source: {scheme.official_url or 'Government of India'}\n"
                f"Last Verified: {scheme.last_verified_at.strftime('%Y-%m-%d') if scheme.last_verified_at else 'Not specified'}\n"
                f"Relevant excerpt: {chunk.chunk_text}\n"
            )

    retrieved_context = "\n---\n".join(context_parts)

    synthesis_prompt = f"""Based ONLY on the following verified government scheme information, answer the user's query.

Retrieved Scheme Information:
{retrieved_context}

User Query: {query}
Business Category: {business_category or 'General'}
State: {state or 'India (Central)'}

Provide a helpful response that:
1. Lists relevant schemes found
2. Explains why each scheme is relevant
3. States basic eligibility conditions
4. Lists required documents (if available)
5. Gives application process pointers
6. ALWAYS cites the source for each scheme
7. If information is incomplete, say "Verify with official source"

NEVER invent scheme names, amounts, or eligibility criteria not present in the retrieved information.
Format as structured JSON:
{{
  "schemes_found": [
    {{
      "name": "<scheme name>",
      "relevance": "<why relevant>",
      "eligibility_summary": "<key eligibility points>",
      "key_benefits": "<main benefits>",
      "required_documents": ["<doc1>", "<doc2>"],
      "application_pointer": "<how to apply>",
      "source": "<official URL or ministry>",
      "last_verified": "<date or 'Not specified'>",
      "confidence": "<High/Medium/Low>"
    }}
  ],
  "summary": "<overall summary>",
  "important_note": "AI-generated summary. Always verify eligibility and details with the relevant government office before applying."
}}"""

    content, tokens = await chat_completion(
        messages=[{"role": "user", "content": synthesis_prompt}],
        temperature=0.1,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    try:
        result = json.loads(content)
        result["rag_used"] = True
        result["chunks_retrieved"] = len(top_chunks)
        result["tokens_used"] = tokens
        return result
    except json.JSONDecodeError:
        return {"schemes_found": [], "summary": content, "rag_used": True}


async def keyword_search_schemes(
    query: str,
    db: Session,
    business_category: str | None = None,
    state: str | None = None,
) -> dict[str, Any]:
    """Fallback: Search schemes by keyword in name/description."""
    q = db.query(GovernmentScheme).filter(GovernmentScheme.is_active == True)
    if state:
        q = q.filter(
            (GovernmentScheme.state == state) | (GovernmentScheme.scheme_type == "Central")
        )

    schemes = q.all()

    # Simple relevance scoring
    query_words = query.lower().split()
    scored = []
    for scheme in schemes:
        score = 0
        text = f"{scheme.name} {scheme.description or ''} {scheme.eligibility or ''}".lower()
        for word in query_words:
            if word in text:
                score += 1
        if business_category and business_category.lower() in text:
            score += 3
        if score > 0:
            scored.append((score, scheme))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_schemes = [s for _, s in scored[:5]]

    return {
        "schemes_found": [
            {
                "name": s.name,
                "relevance": "Keyword match",
                "eligibility_summary": s.eligibility or "Verify with official source",
                "key_benefits": s.benefits or "See official source",
                "required_documents": s.required_documents or [],
                "application_pointer": s.application_process or "Contact nearest Common Service Centre",
                "source": s.official_url or "Government of India portal",
                "last_verified": s.last_verified_at.strftime("%Y-%m-%d") if s.last_verified_at else "Not specified",
                "confidence": "Medium",
            }
            for s in top_schemes
        ],
        "summary": f"Found {len(top_schemes)} potentially relevant schemes based on keyword search.",
        "rag_used": False,
        "important_note": "AI-generated summary. Always verify eligibility and details with the relevant government office before applying.",
    }
