import os
from pymongo import MongoClient, errors

client = None
db = None


def init_db(app=None):
    global client, db

    mongo_uri = None

    if app is not None:
        mongo_uri = app.config.get("MONGO_URI")

    mongo_uri = mongo_uri or os.getenv(
        "MONGO_URI"
    )

    client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000
    )

    try:
        client.server_info()
        print("MongoDB Connected")
        
    except errors.ServerSelectionTimeoutError as e:
        raise RuntimeError(
            f"Could not connect: {e}"
        )

    # directly choose database
    db = client["ai_lead_db"]

    db.users.create_index(
        "email",
        unique=True
    )

    try:
        from models.leadModel import create_indexes as create_lead_indexes
        create_lead_indexes()
    except Exception as exc:
        print(f"Lead index setup skipped: {exc}")
    
    try:
        from models.icpModel import create_indexes as create_icp_indexes
        create_icp_indexes()
    except Exception as exc:
        print(f"ICP index setup skipped: {exc}")
    
    try:
        from models.qualificationResultModel import create_indexes as create_qualification_indexes
        create_qualification_indexes()
    except Exception as exc:
        print(f"Qualification result index setup skipped: {exc}")
    
    try:
        from models.emailModel import create_indexes as create_email_indexes
        create_email_indexes()
    except Exception as exc:
        print(f"Email index setup skipped: {exc}")


def get_db():

    if db is None:
        raise RuntimeError(
            "Database not initialized"
        )

    return db
