from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRoles(str, Enum):
    admin = "admin"
    user = "user"
    manager = "manager"


class AccountStatus(str, Enum):
    normal = "normal"
    suspend = "suspend"


class User(BaseModel):
    id: Optional[str] = None
    hashed_password: str
    activated: bool
    status: AccountStatus

    first_name: str
    last_name: str
    email: EmailStr
    username: str
    pp: Optional[str] = ""
    role: UserRoles = UserRoles.user


class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    username: str
    password: str
    re_password: str


class ResetPassword(BaseModel):
    token: str
    password: str


class UserSettingsProfileCredentials(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    process: bool


class UserSettingsPasswordCredentials(BaseModel):
    current_password: str
    password: str
    re_password: str
    process: bool
