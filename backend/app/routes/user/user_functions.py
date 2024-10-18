from datetime import timedelta
from uuid import uuid4
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from routes.authentication.auth_modules import (
    create_jwt_token,
    decode_jwt_token,
    get_password_hash,
    get_user,
)
from crud.databases import users
from models.user import (
    AccountStatus,
    ResetPassword,
    UserRegister,
    User,
    UserRoles,
    UserSettingsProfileCredentials,
)
from models.utils import Message
from redmail import gmail, EmailSender
from modules.config import config
from os import getenv


def change_password(password: str, user: User):
    users.find_one_and_update(
        {"id": user.id}, {"$set": {"hashed_password": get_password_hash(password)}}
    )
    return "Password changed."


def register_user_to_database(data: UserRegister) -> ObjectId:
    return users.insert_one(
        jsonable_encoder(
            User(
                id=str(uuid4()),
                first_name=data.first_name.strip(),
                last_name=data.last_name.strip(),
                email=data.email.strip(),
                username=data.username.strip(),
                hashed_password=get_password_hash(data.password),
                activated=False,
                status=AccountStatus.normal,
                role=UserRoles.user,
            )
        )
    ).inserted_id


def register_user(data: UserRegister) -> bool:
    if users.find_one({"email": data.email}):
        return Message(text="Email already registered!", status=False)
    elif users.find_one({"username": data.username}):
        return Message(text="Username already registered!", status=False)
    elif data.password != data.re_password:
        return Message(text="Passwords not match!", status=False)

    try:
        id = register_user_to_database(data)
        if id:
            return Message(text="Registered successfully!", status=True)
    except:
        pass

    return Message(text="Error occurred, please contact with us!", status=False)


def get_password_reset_token(user: User) -> str:
    token = create_jwt_token(
        data={"email": user.email},
        expires_delta=timedelta(minutes=15),
    )
    return token


def send_password_reset_link(email: str) -> None:
    user = get_user(email)
    if user:
        token = get_password_reset_token(user)

        email_service = EmailSender(
            host=getenv("HELPER_EMAIL_HOST"),  # Replace with your SMTP host
            port=int(getenv("HELPER_EMAIL_PORT")),  # SMTP port, usually 587 for TLS
            username=getenv("HELPER_EMAIL"),
            password=getenv("HELPER_EMAIL_PASSWORD"),
        )

        email_service.send(
            sender=getenv("HELPER_EMAIL"),  # From email address
            receivers=[email],
            subject=f"{getenv("HELPER_EMAIL_APP_NAME")} - Password Reset",
            html=f"""
                <h1>Hii {user.username}, you can reset your password with following link:</h1>
                <a href="{getenv("APP_URI")}/reset_password/?reset={token}" target="_blank">{getenv("APP_URI")}/reset_password/?reset={token}</a>
            """,
        )


def reset_password(data: ResetPassword) -> None:
    user: dict = users.find_one({"email": decode_jwt_token(data.token).get("email")})

    if user:
        users.find_one_and_update(
            {"_id": user.get("_id")},
            {"$set": {"hashed_password": get_password_hash(data.password)}},
        )
    else:
        raise Exception("User dont exist!")


def update_profile(profile_data: UserSettingsProfileCredentials, user: User):
    users.find_one_and_update(
        {"id": user.id},
        {
            "$set": {
                "email": profile_data.email,
                "username": profile_data.username,
                "first_name": profile_data.first_name,
                "last_name": profile_data.last_name,
            }
        },
    )

    return "ok"


def get_user_with_id(user_id) -> dict:
    return users.find_one({"id": user_id})


# example users for tests
"""users.insert_many(
    [
        {
            "id": "3c3e11ed-3f0a-496a-a314-1a0c354b0a5b",
            "hashed_password": "$2b$12$MioCVs.JHrXZUj.C7cZuLeKJ5BuiWLDxxurBi8RZngAnAr3c24JWm",
            "activated": True,
            "status": "normal",
            "first_name": "Wind",
            "last_name": "Walker",
            "email": "windwalker@nomads.net",
            "username": "windwalker",
            "pp": "",
            "role": "user",
        },
        {
            "id": "6b9460fc-f8dc-47a7-98c6-c2210488f1ab",
            "hashed_password": "$2b$12$ljMEiV7QJETvTwER2VQ5GehsFjxHlK41NVE2le9KV8gl4n.bCVZRS",
            "activated": False,
            "status": "normal",
            "first_name": "Cloud",
            "last_name": "Pilot",
            "email": "cloudpilot@sky.com",
            "username": "cloudpilot",
            "pp": "",
            "role": "admin",
        },
        {
            "id": "5f9090f7-d22c-4b58-82db-3a0db5a88db9",
            "hashed_password": "$2b$12$FfOR19Rz.kozLecGzxVlJO8eJ3RZxTnKHFkOKvxpBs3PK.ZY4KVCy",
            "activated": True,
            "status": "normal",
            "first_name": "Polar",
            "last_name": "Gust",
            "email": "polargust@coolmail.com",
            "username": "polargust",
            "pp": "",
            "role": "user",
        },
        {
            "id": "b34e77da-8131-4ebe-9572-5c34c971c992",
            "hashed_password": "$2b$12$3WDeSBD0ZNTzntU8JZaO2Op7trksXx43KnIdDWTZq4FkKcALcTv0C",
            "activated": False,
            "status": "suspend",
            "first_name": "Breeze",
            "last_name": "Shifter",
            "email": "breezeshifter@windy.net",
            "username": "breezeshifter",
            "pp": "",
            "role": "user",
        },
        {
            "id": "38bbf457-9c08-4888-bd73-dcadc53db3b0",
            "hashed_password": "$2b$12$uI5.y8RZrGJs2.nQx19piOlbLZ.7fB9Fvz3wtysvX5LkR8PgUjT6i",
            "activated": True,
            "status": "normal",
            "first_name": "Cirrus",
            "last_name": "Drift",
            "email": "cirrusdrift@airmail.com",
            "username": "cirrusdrift",
            "pp": "",
            "role": "user",
        },
    ]
)
"""
