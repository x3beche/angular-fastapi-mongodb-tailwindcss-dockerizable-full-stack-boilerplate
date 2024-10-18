from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ContentTypes(str, Enum):
    user = "user"
    general = "general"
    administration = "administration"


class FileTypes(str, Enum):
    document = "document"
    image = "image"


class FileModel(BaseModel):
    id: str
    name: str
    size: int
    added_date: datetime
    added_by: str
    activated: bool
    file_type: FileTypes
    content_type: ContentTypes
    usage: str = ""
    updated_by: str = ""
    content: str = ""


class FileModelLite(BaseModel):
    id: str
    name: str
    size: int
    loading_status: bool
    content: str = ""
