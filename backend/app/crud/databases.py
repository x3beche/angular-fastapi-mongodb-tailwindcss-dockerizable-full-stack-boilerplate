import gridfs, pymongo, os
from modules.config import config

client = pymongo.MongoClient(os.getenv("MONGODB_URI", ""))

db = client[os.getenv("DB_NAME", "")]
users = db["users"]
deleted_users = db["deleted_users"]
files_db = db["files_db"]
general_settings = db["general_settings"]

fs = gridfs.GridFS(db)
