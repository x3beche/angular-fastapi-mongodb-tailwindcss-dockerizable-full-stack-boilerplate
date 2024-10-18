import io
from datetime import datetime
from typing import List
from bson import ObjectId
from fastapi import Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from routes.content.models import ContentTypes, FileModel, FileModelLite, FileTypes
from models.user import User, UserRoles
from routes.authentication.auth_modules import get_session
from crud.databases import users, fs, files_db
from app import app
from routes.content.modules import get_content_user


@app.post("/user/content_upload/", tags=["user operations"])
def upload_files(
    files: List[UploadFile] = File(...), user: User = Depends(get_session)
):

    file_descriptions = []

    for file in files:
        content = file.file.read()
        gridfs_file_id = fs.put(content, filename=file.filename)

        if file.content_type == "application/pdf":
            file_type = FileTypes.document
        else:
            break

        file_model = FileModel(
            id=str(gridfs_file_id),
            name=file.filename,
            size=len(content),
            added_date=datetime.utcnow(),
            added_by=user.id,
            content_type=ContentTypes.user,
            file_type=file_type,
            activated=True,
            content="",
            updated_by="",
            usage="",
        )
        file_descriptions.append(file_model)

    db_results = files_db.insert_many(
        [dict(file_data) for file_data in file_descriptions]
    )

    lite_file_descriptions = []
    for file_data in file_descriptions:
        file_data: FileModel
        lite_file_descriptions.append(
            FileModelLite(
                id=file_data.id,
                name=file_data.name,
                size=file_data.size,
                loading_status=True,
            )
        )

    return lite_file_descriptions


@app.post("/content/upload/", tags=["administrator content operations"])
def upload_files(
    files: List[UploadFile] = File(...), user: User = Depends(get_session)
):
    if user.role in [UserRoles.admin, UserRoles.manager]:
        file_descriptions = []

        for file in files:
            content = file.file.read()
            gridfs_file_id = fs.put(content, filename=file.filename)

            if file.content_type == "application/pdf":
                file_type = FileTypes.document
            elif file.content_type in ["image/jpeg", "image/png", "image/webp"]:
                file_type = FileTypes.image
            else:
                return "OK"

            file_model = FileModel(
                id=str(gridfs_file_id),
                name=file.filename,
                size=len(content),
                added_date=datetime.utcnow(),
                added_by=user.id,
                content_type=ContentTypes.administration,
                file_type=file_type,
                activated=True,
                content="",
                updated_by="",
                usage="",
            )
            file_descriptions.append(file_model)

        db_results = files_db.insert_many(
            [dict(file_data) for file_data in file_descriptions]
        )

        for file_data in file_descriptions:
            file_data: FileModel
            file_data.added_by = User(
                **users.find_one({"id": file_data.added_by})
            ).email

        return file_descriptions


@app.get("/content/general_file_list/", tags=["administrator content operations"])
def get_general_file_list_route(user: User = Depends(get_session)) -> List[FileModel]:
    data = []
    if user.role in [UserRoles.admin, UserRoles.manager]:
        files_ = files_db.find(
            {
                "content_type": {
                    "$in": [ContentTypes.administration, ContentTypes.general]
                }
            }
        )

        for file in files_:
            file_ = FileModel(**file)
            file_.added_by = get_content_user(file_.added_by).email
            data.append(file_)

        return data


@app.post("/content/update_file/", tags=["administrator content operations"])
def upload_files(file: FileModel, user: User = Depends(get_session)) -> FileModel:
    if user.role in [UserRoles.admin, UserRoles.manager]:
        files_db.update_one(
            {"id": file.id},
            {"$set": {"activated": file.activated, "usage": file.usage}},
        )
        return file


@app.post("/content/delete_file/", tags=["administrator content operations"])
def delete_file_route(file: FileModel, user: User = Depends(get_session)) -> str:
    if user.role in [UserRoles.admin, UserRoles.manager]:
        files_db.delete_one({"id": file.id})
        fs.delete(ObjectId(file.id))
        return "ok"


@app.get("/company_logo/", tags=["general media"])
def upload_files():
    # Convert image_id to ObjectId
    file: dict = files_db.find_one(
        {
            "content_type": ContentTypes.administration,
            "usage": "company_logo",
            "activated": True,
        }
    )

    image_oid = ObjectId(file.get("id"))

    # Fetch the file from GridFS
    grid_out = fs.get(image_oid)

    # Read image data
    image_data = grid_out.read()

    # Return the image as a StreamingResponse
    return StreamingResponse(io.BytesIO(image_data), media_type="image/png")


@app.get("/content/favicon", tags=["general media"])
def upload_files():
    # Convert image_id to ObjectId
    file: dict = files_db.find_one(
        {
            "content_type": ContentTypes.administration,
            "usage": "favicon",
            "activated": True,
        }
    )

    image_oid = ObjectId(file.get("id"))

    # Fetch the file from GridFS
    grid_out = fs.get(image_oid)

    # Read image data
    image_data = grid_out.read()

    # Return the image as a StreamingResponse
    return StreamingResponse(io.BytesIO(image_data), media_type="image/png")


"""remove_user_files()
"""
