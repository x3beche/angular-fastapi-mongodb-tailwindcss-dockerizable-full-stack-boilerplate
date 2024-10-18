# Define the message structure
from ast import List
from datetime import datetime
from os import system
from typing import Optional, List, Union
from pydantic import BaseModel
from routes.content.models import FileModelLite
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage


class SummaryConvRequests(BaseModel):
    conv_id: str


class GetConvModel(BaseModel):
    conv_id: str


class SummaryConvResponse(BaseModel):
    conv_id: str
    summary: str


class ChatStreamRequest(BaseModel):
    ocr: List[str] = []
    content: str
    modal_name: str
    conv_id: str


class ChatMessage(BaseModel):
    role: str
    content: str
    ocr: List[FileModelLite] = []
    date: Optional[datetime] = None  # New date field


class Conversation(BaseModel):
    conv_id: str
    user_id: str
    summary: str
    messages: List[
        Union[ChatMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage]
    ]


class ConvCredentials(BaseModel):
    user_id: str
    conv_id: str


class ConvMetadata(BaseModel):
    conv_id: str
    summary: Optional[str] = ""
