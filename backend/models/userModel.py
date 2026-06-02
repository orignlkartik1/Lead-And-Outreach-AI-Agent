from datetime import datetime
from bson.objectid import ObjectId
from config.db import get_db


def create_indexes():
    db = get_db()
    db.users.create_index('email', unique=True)


def sanitize_user_doc(doc):
    if not doc:
        return None
    return {
        'id': str(doc.get('_id')),
        'name': doc.get('name'),
        'email': doc.get('email'),
        'createdAt': doc.get('createdAt')
    }


def get_user_by_email(email):
    db = get_db()
    return db.users.find_one({'email': email})


def get_user_by_id(user_id):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return db.users.find_one({'_id': oid})


def create_user(name, email, password_hashed_str):
    db = get_db()
    user = {
        'name': name,
        'email': email,
        # store hashed password as utf-8 string for portability
        'password': password_hashed_str,
        'createdAt': datetime.utcnow()
    }
    result = db.users.insert_one(user)
    user['_id'] = result.inserted_id
    return user
