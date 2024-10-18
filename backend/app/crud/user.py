from crud.databases import users
from models.user import User
from bson import ObjectId


class UserAPI:
    def __init__(self, id: ObjectId, dynamic=True) -> None:
        # declerations
        self._id: ObjectId = id
        self.dynamic = dynamic
        self.user: User

        # operations
        user: dict = users.find_one({"_id": self._id})
        self._id = user.get("_id")
        self.user = User(id=str(self._id), **user)

    def update_user(self) -> None:
        if self.dynamic:
            user: dict = users.find_one({"_id": self._id})
            self._id = user.get("_id")
            self.user = User(id=str(self._id), **user)

    def get(self) -> User:
        self.update_user()
        return self.user
