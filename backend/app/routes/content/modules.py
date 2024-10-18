from typing import List
from bson import ObjectId
from models.user import User
from routes.content.models import FileModel, FileModelLite
from crud.databases import files_db, users, deleted_users, fs


def remove_user_files():
    for file in files_db.find({"content_type": "user"}):
        fs.delete(ObjectId(file.get("id")))
    files_db.delete_many({"content_type": "user"})


def get_content_user(user_id: str) -> User:
    try:
        return User(**users.find_one({"id": user_id}))
    except:
        try:
            return User(**deleted_users.find_one({"id": user_id}))
        except:
            return "User did not found in DB."
