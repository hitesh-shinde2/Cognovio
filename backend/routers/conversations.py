
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from database import get_db
from models.conversation import Conversation, ChatMessage
from models.user import User
from routes.auth import get_current_user


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


# Request schemas

class ConversationCreate(BaseModel):
    title: str | None = None


class MessageCreate(BaseModel):
    role: Literal["user", "assistant"]
    content: str


# 1. Create a conversation

@router.post("/")
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = Conversation(
        user_id=current_user.id,
        title=data.title
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "message": "Conversation created successfully",
        "conversation_id": conversation.id,
        "title": conversation.title
    }


# 2. Get all conversations of logged-in user

@router.get("/")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }
        for conversation in conversations
    ]


# 3. Get conversation with its messages

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )

    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "provider": message.provider,
                "model": message.model,
                "created_at": message.created_at
            }
            for message in messages
        ]
    }


# 4. Save a message in a conversation

@router.post("/{conversation_id}/messages")
def add_message(
    conversation_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    message = ChatMessage(
        conversation_id=conversation.id,
        role=data.role,
        content=data.content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "message": "Message saved successfully",
        "message_id": message.id,
        "conversation_id": conversation.id
    }


# 5. Delete a conversation

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    db.delete(conversation)
    db.commit()

    return {
        "message": "Conversation deleted successfully"
    }
