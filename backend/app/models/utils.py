from pydantic import BaseModel


class Config(BaseModel):
    version: str
    secret_key: str


class Message(BaseModel):
    text: str
    status: bool
