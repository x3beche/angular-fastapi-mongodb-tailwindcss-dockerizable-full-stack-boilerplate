from bson import ObjectId
import httpx
from app import app
from models.user import (
    ResetPassword,
    User,
    UserRegister,
    UserSettingsPasswordCredentials,
    UserSettingsProfileCredentials,
)
from models.utils import Message
from routes.authentication.auth_modules import (
    get_session,
    verify_password,
)
from fastapi import Depends, File, HTTPException, Response, UploadFile
from crud.databases import fs, users
from routes.user.user_functions import (
    change_password,
    register_user,
    reset_password,
    send_password_reset_link,
    update_profile,
)


@app.get("/user/", response_model=User, tags=["user operations"])
def user_data_route(user: User = Depends(get_session)):
    user.hashed_password = ""
    user.id = ""
    return user


@app.post("/register/", response_model=Message, tags=["user authentication"])
def user_register_route(user: UserRegister):
    return register_user(user)


@app.get("/forget_password/", response_model=bool, tags=["user authentication"])
def forget_password_route(email: str):
    send_password_reset_link(email)
    return True


@app.post("/reset_password/", response_model=Message, tags=["user authentication"])
def reset_password_route(data: ResetPassword):
    try:
        reset_password(data)
        return Message(
            text="Your password has been changed successfully, you are directed to the login page.",
            status=True,
        )
    except:
        return Message(
            text="This password change address has expired. Try again by getting a new one.",
            status=False,
        )


@app.post("/update_profile/", tags=["user operations"])
def update_profile_route(
    profile_data: UserSettingsProfileCredentials, user: User = Depends(get_session)
):
    return update_profile(profile_data, user)


@app.post("/update_password/", tags=["user operations"])
def update_password_route(
    password_data: UserSettingsPasswordCredentials, user: User = Depends(get_session)
):
    # Logic to check if the passwords match
    if password_data.password != password_data.re_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Add logic to update the password here
    if verify_password(password_data.current_password, user.hashed_password):
        return change_password(password_data.password, user)

    raise HTTPException(status_code=400, detail="Current password is wrong.")


@app.post("/update_profile_picture/", tags=["user operations"])
async def create_file(
    profile_picture: UploadFile = File(...), user: User = Depends(get_session)
):
    file_content = await profile_picture.read()  # Read the file once
    file_size = len(file_content)  # Calculate the file size

    file_id = fs.put(
        file_content,
        filename=profile_picture.filename,
        content_type=profile_picture.content_type,
    )

    if user.pp:
        fs.delete(ObjectId(user.pp))

    users.find_one_and_update({"id": user.id}, {"$set": {"pp": str(file_id)}})

    return {"filename": profile_picture.filename, "file_size": file_size}


@app.get("/profile_picture/{id}", tags=["user operations"])
def get_profile_picture(id: str):
    user = users.find_one({"id": id})
    if not user.get("pp"):
        # Define the URL of the default image
        default_image_url = "https://res.cloudinary.com/apideck/image/upload/w_196,f_auto/v1677940393/marketplaces/ckhg56iu1mkpc0b66vj7fsj3o/listings/meta_nnmll6.webp"
        client = httpx.Client()
        resp = client.get(default_image_url)
        client.close()
        return Response(content=resp.content, media_type="image/webp")

    # Assuming 'fs' is a GridFS instance initialized elsewhere to handle file storage
    return Response(content=fs.get(ObjectId(user["pp"])).read(), media_type="image")
