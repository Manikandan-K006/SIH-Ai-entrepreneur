import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.entrepreneur import EntrepreneurProfile
from app.models.ai_log import AIConversation, AIConversationMessage, AIExecutionLog
from app.api.v1.endpoints.auth import get_current_user
from app.ai.agent_router import classify_intent, generate_satya_response
from app.ai.agents.scheme_agent import search_schemes_rag

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["SATYA AI"])


class ChatMessage(BaseModel):
    content: str
    session_id: Optional[str] = None
    language: str = "en"


class ChatResponse(BaseModel):
    response: str
    session_id: str
    execution_trace: dict
    disclaimer: str = "AI-generated response. Verify important decisions with qualified professionals."


def build_user_context(user: User, profile: Optional[EntrepreneurProfile]) -> dict:
    if not profile:
        return {"name": user.full_name, "role": user.role.value}
    return {
        "name": user.full_name,
        "business_category": profile.business_category,
        "business_idea": profile.business_idea,
        "location": f"{profile.village_town or ''}, {profile.district or ''}, {profile.state or ''}".strip(", "),
        "state": profile.state,
        "district": profile.district,
        "available_capital": profile.available_capital,
        "skills": profile.skills or [],
        "business_stage": profile.business_stage,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat_with_satya(
    message: ChatMessage,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    start_time = time.time()

    # Get or create session
    session_id = message.session_id or str(uuid.uuid4())

    # Get user profile for context
    profile = db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == current_user.id).first()
    user_context = build_user_context(current_user, profile)

    # Get conversation history
    conversation = db.query(AIConversation).filter(
        AIConversation.session_id == session_id,
        AIConversation.user_id == current_user.id,
    ).first()

    if not conversation:
        conversation = AIConversation(
            user_id=current_user.id,
            session_id=session_id,
            title=message.content[:80],
            language=message.language,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    history = []
    prev_messages = db.query(AIConversationMessage).filter(
        AIConversationMessage.conversation_id == conversation.id
    ).order_by(AIConversationMessage.id.desc()).limit(10).all()
    for m in reversed(prev_messages):
        history.append({"role": m.role, "content": m.content})

    # Classify intent
    intent_result = await classify_intent(message.content, user_context)
    agents_needed = intent_result.get("agents_needed", ["general"])
    total_tokens = intent_result.get("tokens", 0)

    # Retrieve scheme context if scheme agent needed
    retrieved_context = ""
    data_sources = ["SATYA Knowledge Base"]
    if "scheme" in agents_needed:
        try:
            scheme_data = await search_schemes_rag(
                message.content, db,
                business_category=user_context.get("business_category"),
                state=user_context.get("state"),
            )
            if scheme_data.get("schemes_found"):
                scheme_text = "\n".join([
                    f"- {s['name']}: {s.get('eligibility_summary', '')} (Source: {s.get('source', 'GoI')})"
                    for s in scheme_data["schemes_found"][:3]
                ])
                retrieved_context = f"Relevant Government Schemes:\n{scheme_text}"
                data_sources.append("Government Scheme Database")
        except Exception as e:
            logger.warning(f"Scheme search failed: {e}")

    # Generate response
    try:
        response_text, resp_tokens = await generate_satya_response(
            query=message.content,
            conversation_history=history,
            user_context=user_context,
            retrieved_context=retrieved_context,
            language=message.language,
        )
        total_tokens += resp_tokens
    except Exception as e:
        logger.error(f"SATYA response generation failed: {e}")
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")

    execution_time = int((time.time() - start_time) * 1000)

    execution_trace = {
        "intent": intent_result.get("primary_intent", "general_advice"),
        "agents_used": agents_needed,
        "tools_used": ["language_model", "scheme_rag"] if "scheme" in agents_needed else ["language_model"],
        "data_sources": data_sources,
        "key_inputs": intent_result.get("key_entities", {}),
        "result_summary": f"Generated response in {execution_time}ms",
        "confidence": intent_result.get("confidence", 0.8),
        "execution_time_ms": execution_time,
        "tokens_used": total_tokens,
    }

    # Save to DB in background
    def save_messages():
        try:
            user_msg = AIConversationMessage(
                conversation_id=conversation.id,
                role="user",
                content=message.content,
            )
            ai_msg = AIConversationMessage(
                conversation_id=conversation.id,
                role="assistant",
                content=response_text,
                message_metadata={"execution_trace": execution_trace},
            )
            db.add_all([user_msg, ai_msg])
            exec_log = AIExecutionLog(
                user_id=current_user.id,
                conversation_id=conversation.id,
                query=message.content,
                intent=execution_trace["intent"],
                agents_used=execution_trace["agents_used"],
                tools_used=execution_trace["tools_used"],
                data_sources=execution_trace["data_sources"],
                key_inputs=execution_trace["key_inputs"],
                result_summary=execution_trace["result_summary"],
                confidence_score=execution_trace["confidence"],
                execution_time_ms=execution_trace["execution_time_ms"],
                tokens_used=execution_trace["tokens_used"],
            )
            db.add(exec_log)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save messages: {e}")

    background_tasks.add_task(save_messages)

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        execution_trace=execution_trace,
    )


@router.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = (
        db.query(AIConversation)
        .filter(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {"id": c.id, "session_id": c.session_id, "title": c.title, "created_at": c.created_at}
        for c in conversations
    ]


@router.get("/conversations/{session_id}/messages")
def get_conversation_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = db.query(AIConversation).filter(
        AIConversation.session_id == session_id,
        AIConversation.user_id == current_user.id,
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = (
        db.query(AIConversationMessage)
        .filter(AIConversationMessage.conversation_id == conversation.id)
        .order_by(AIConversationMessage.id.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "metadata": m.message_metadata,
            "created_at": m.created_at,
        }
        for m in messages
    ]
