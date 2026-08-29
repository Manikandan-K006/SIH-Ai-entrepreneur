import uuid
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.models.connection import ConnectionRequest, Message, Notification, ConnectionStatus
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/communication", tags=["Communication"])


class ConnectionRequestCreate(BaseModel):
    to_user_id: Optional[int] = None
    to_mentor_id: Optional[int] = None
    to_supplier_id: Optional[int] = None
    to_buyer_id: Optional[int] = None
    connection_type: str
    message: Optional[str] = None


class MessageCreate(BaseModel):
    receiver_id: int
    content: str


@router.post("/connect")
def send_connection_request(
    data: ConnectionRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = ConnectionRequest(
        from_user_id=current_user.id,
        to_user_id=data.to_user_id,
        to_mentor_id=data.to_mentor_id,
        to_supplier_id=data.to_supplier_id,
        to_buyer_id=data.to_buyer_id,
        connection_type=data.connection_type,
        message=data.message,
    )
    db.add(req)
    # Notification for receiver
    if data.to_user_id:
        notif = Notification(
            user_id=data.to_user_id,
            notification_type="connection_request",
            title=f"{current_user.full_name} wants to connect with you",
            content=data.message or "Connection request",
            link=f"/connections",
        )
        db.add(notif)
    db.commit()
    db.refresh(req)
    return {"id": req.id, "status": req.status, "message": "Connection request sent"}


@router.get("/connections")
def get_my_connections(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sent = db.query(ConnectionRequest).filter(ConnectionRequest.from_user_id == current_user.id).all()
    received = db.query(ConnectionRequest).filter(ConnectionRequest.to_user_id == current_user.id).all()
    return {"sent": sent, "received": received}


@router.put("/connections/{request_id}/respond")
def respond_to_connection(
    request_id: int,
    action: str = Query(..., regex="^(accept|reject)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    req = db.query(ConnectionRequest).filter(
        ConnectionRequest.id == request_id,
        ConnectionRequest.to_user_id == current_user.id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Connection request not found")
    req.status = ConnectionStatus.ACCEPTED if action == "accept" else ConnectionStatus.REJECTED
    req.responded_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": req.status}


@router.post("/messages/send")
def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    thread_id = "-".join(sorted([str(current_user.id), str(data.receiver_id)]))
    msg = Message(
        thread_id=thread_id,
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        content=data.content,
    )
    db.add(msg)
    # Add notification
    notif = Notification(
        user_id=data.receiver_id,
        notification_type="new_message",
        title=f"New message from {current_user.full_name}",
        content=data.content[:100],
        link=f"/messages",
    )
    db.add(notif)
    db.commit()
    db.refresh(msg)
    return {"id": msg.id, "thread_id": thread_id, "sent": True}


@router.get("/messages/{other_user_id}")
def get_messages(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    thread_id = "-".join(sorted([str(current_user.id), str(other_user_id)]))
    messages = (
        db.query(Message)
        .filter(Message.thread_id == thread_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    # Mark as read
    for m in messages:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
            m.read_at = datetime.now(timezone.utc)
    db.commit()
    return messages


@router.get("/notifications")
def get_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    return q.order_by(Notification.created_at.desc()).limit(50).all()


@router.put("/notifications/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True, "read_at": datetime.now(timezone.utc)})
    db.commit()
    return {"message": "All notifications marked as read"}
