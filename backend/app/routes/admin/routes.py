from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from routes.user.user_functions import get_user_with_id
from models.user import User, UserRoles
from routes.authentication.auth_modules import get_session
from crud.databases import (
    users,
    deleted_users,
    general_settings,
)
from app import app


def insufficient_auth():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Insufficient authorization",
    )


class CompanyName(BaseModel):
    name: str


# user manager
@app.get("/admin/get_users/", tags=["administration"])
def get_users(user: User = Depends(get_session)):

    if user.role == UserRoles.user:
        raise insufficient_auth()

    users_ = []
    for user_ in users.find({}):
        user = User(**user_)
        user.hashed_password = ""
        users_.append(user)
    return users_


@app.post("/admin/update_user/", tags=["administration"])
def get_users(user: User, session_user: User = Depends(get_session)):

    if session_user.role == UserRoles.user:
        raise insufficient_auth()

    updated_data = user.dict(
        exclude_unset=True, exclude={"id", "hashed_password", "pp"}
    )

    if session_user.role == UserRoles.admin:
        users.find_one_and_update(
            {"id": user.id},
            {"$set": updated_data},
        )
        return "ok updated"

    elif session_user.role == UserRoles.manager:
        if user.role == UserRoles.admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Managers can not upgrade users to admin.",
            )
        users.find_one_and_update(
            {"id": user.id},
            {"$set": updated_data},
        )
        return "ok updated"


@app.delete("/admin/delete_user/", tags=["administration"])
def delete_user_route(user_id: str, user: User = Depends(get_session)):

    if user.role == UserRoles.user:
        raise insufficient_auth()

    user_db = get_user_with_id(user_id)
    user_db.pop("_id")
    deleted_users.insert_one(user_db)
    users.delete_one({"id": user_id})
    return "ok"


@app.post("/admin/company_name/", tags=["administration"])
def update_company_name(company_name: CompanyName, user: User = Depends(get_session)):
    if user.role in [UserRoles.user, UserRoles.manager]:
        raise insufficient_auth()

    query = {"field": "company_name"}
    update = {"$set": {"name": company_name.name}}

    result = general_settings.find_one_and_update(
        query,
        update,
        upsert=True,
        return_document=True,
    )

    return company_name.name


@app.get("/admin/company_name/", tags=["administration"])
def get_company_name() -> str:
    query = {"field": "company_name"}
    res = general_settings.find_one(query)
    if res:
        return res.get("name")
    else:
        return ""
