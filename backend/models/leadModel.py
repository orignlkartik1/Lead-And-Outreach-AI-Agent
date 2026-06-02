from datetime import datetime
from bson.objectid import ObjectId
from pymongo import UpdateOne
from config.db import get_db


LEAD_FIELDS = ["Name", "Company", "Role", "Industry", "Email", "Employee Count", "Company Tech Stack", "Currently Hiring"]


def create_indexes():
    db = get_db()
    db.leads.create_index([("userId", 1), ("emailKey", 1)], unique=True)
    db.leads.create_index([("userId", 1), ("batchId", 1)])
    db.lead_batches.create_index([("userId", 1), ("createdAt", -1)])


def _oid(value):
    try:
        return ObjectId(value)
    except Exception:
        return None


def sanitize_lead_doc(doc):
    if not doc:
        return None

    return {
        "id": str(doc.get("_id")),
        "batchId": str(doc.get("batchId")) if doc.get("batchId") else None,
        "Name": doc.get("name", ""),
        "Company": doc.get("company", ""),
        "Role": doc.get("role", ""),
        "Industry": doc.get("industry", ""),
        "Email": doc.get("email", ""),
        "Employee Count": doc.get("employeeCount", ""),
        "Company Tech Stack": doc.get("companyTechStack", ""),
        "Funding Stage": doc.get("fundingStage", ""),
        "Location": doc.get("location", ""),
        "Recent Trigger Event": doc.get("recentTriggerEvent", ""),
        "Target Role Match": doc.get("targetRoleMatch", ""),
        "Currently Hiring": doc.get("currentlyHiring", ""),
        "status": doc.get("status", "preview"),
        "duplicateStatus": doc.get("duplicateStatus", "new"),
        "qualified": doc.get("qualified"),
        "score": doc.get("score"),
        "researchSummary": doc.get("researchSummary", ""),
        "qualificationReasons": doc.get("qualificationReasons", []),
        "qualificationReason": doc.get("qualificationReason", ""),
        "strengths": doc.get("strengths", []),
        "weaknesses": doc.get("weaknesses", []),
        "recommendedAction": doc.get("recommendedAction", ""),
        "priorityLevel": doc.get("priorityLevel", "medium"),
        "aiGeneratedReasoning": doc.get("aiGeneratedReasoning", ""),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def sanitize_batch_doc(doc):
    if not doc:
        return None

    stats = doc.get("stats") or {}
    return {
        "id": str(doc.get("_id")),
        "fileName": doc.get("fileName"),
        "status": doc.get("status", "preview"),
        "stats": {
            "uploadedRows": stats.get("uploadedRows", 0),
            "savedRows": stats.get("savedRows", 0),
            "duplicateRows": stats.get("duplicateRows", 0),
            "updatedRows": stats.get("updatedRows", 0),
        },
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }


def create_batch(user_id, file_name, stats):
    db = get_db()
    now = datetime.utcnow()
    batch = {
        "userId": ObjectId(user_id),
        "fileName": file_name,
        "status": "preview",
        "stats": stats,
        "createdAt": now,
        "updatedAt": now,
    }
    result = db.lead_batches.insert_one(batch)
    batch["_id"] = result.inserted_id
    return batch


def save_leads_for_batch(user_id, batch_id, leads):
    db = get_db()
    user_oid = ObjectId(user_id)
    batch_oid = ObjectId(batch_id)
    now = datetime.utcnow()

    operations = []
    for lead in leads:
        email_key = lead["email"].strip().lower()
        doc = {
            "userId": user_oid,
            "batchId": batch_oid,
            "name": lead.get("name", ""),
            "company": lead.get("company", ""),
            "role": lead.get("role", ""),
            "industry": lead.get("industry", ""),
            "email": lead.get("email", ""),
            "emailKey": email_key,
            "employeeCount": lead.get("employeeCount", ""),
            "companyTechStack": lead.get("companyTechStack", ""),
            "fundingStage": lead.get("fundingStage", ""),
            "location": lead.get("location", ""),
            "recentTriggerEvent": lead.get("recentTriggerEvent", ""),
            "targetRoleMatch": lead.get("targetRoleMatch", ""),
            "currentlyHiring": lead.get("currentlyHiring", ""),
            "status": "preview",
            "duplicateStatus": lead.get("duplicateStatus", "new"),
            "updatedAt": now,
        }
        operations.append(
            UpdateOne(
                {"userId": user_oid, "emailKey": email_key},
                {"$set": doc, "$setOnInsert": {"createdAt": now}},
                upsert=True,
            )
        )

    if operations:
        db.leads.bulk_write(operations, ordered=False)

    return list(db.leads.find({"userId": user_oid, "batchId": batch_oid}).sort("createdAt", 1))


def existing_email_keys(user_id, email_keys):
    if not email_keys:
        return set()

    db = get_db()
    user_oid = ObjectId(user_id)
    docs = db.leads.find(
        {"userId": user_oid, "emailKey": {"$in": list(email_keys)}},
        {"emailKey": 1},
    )
    return {doc.get("emailKey") for doc in docs if doc.get("emailKey")}


def list_leads(user_id, batch_id=None, lead_id=None):
    db = get_db()
    query = {"userId": ObjectId(user_id)}
    if batch_id:
        oid = _oid(batch_id)
        if not oid:
            return []
        query["batchId"] = oid
    if lead_id:
        oid = _oid(lead_id)
        if not oid:
            return []
        query["_id"] = oid
    return list(db.leads.find(query).sort("updatedAt", -1))


def get_batch(user_id, batch_id):
    oid = _oid(batch_id)
    if not oid:
        return None
    db = get_db()
    return db.lead_batches.find_one({"_id": oid, "userId": ObjectId(user_id)})


def update_batch_status(user_id, batch_id, status, stats=None):
    db = get_db()
    update = {"status": status, "updatedAt": datetime.utcnow()}
    if stats is not None:
        update["stats"] = stats
    db.lead_batches.update_one(
        {"_id": ObjectId(batch_id), "userId": ObjectId(user_id)},
        {"$set": update},
    )


def mark_leads_qualified(user_id, batch_id, qualified_leads):
    db = get_db()
    user_oid = ObjectId(user_id)
    batch_oid = ObjectId(batch_id)
    now = datetime.utcnow()
    operations = []

    for lead in qualified_leads:
        # Build comprehensive update with all qualification data
        update_data = {
            "status": lead.get("status", "qualified"),
            "qualified": lead.get("qualified", False),
            "score": lead.get("score"),
            "researchSummary": lead.get("researchSummary", ""),
            "qualificationReasons": lead.get("qualificationReasons", []),
            "qualificationReason": lead.get("qualificationReason", ""),
            "strengths": lead.get("strengths", []),
            "weaknesses": lead.get("weaknesses", []),
            "recommendedAction": lead.get("recommendedAction", ""),
            "priorityLevel": lead.get("priorityLevel", "medium"),
            "aiGeneratedReasoning": lead.get("aiGeneratedReasoning", ""),
            "updatedAt": now,
        }
        
        operations.append(
            UpdateOne(
                {"_id": ObjectId(lead["id"]), "userId": user_oid, "batchId": batch_oid},
                {"$set": update_data},
            )
        )

    if operations:
        db.leads.bulk_write(operations, ordered=False)

    return list(db.leads.find({"userId": user_oid, "batchId": batch_oid}).sort("updatedAt", -1))


def get_latest_batch(user_id):
    """Fetch the most recently uploaded CSV batch for user."""
    db = get_db()
    batch = db.lead_batches.find_one(
        {"userId": ObjectId(user_id)},
        sort=[("createdAt", -1)]
    )
    return batch


def get_latest_batch_leads(user_id):
    """
    Fetch all leads from the most recently uploaded batch.
    Critical: ONLY returns leads from the latest batch.
    """
    db = get_db()
    user_oid = ObjectId(user_id)
    
    # Get the latest batch
    latest_batch = db.lead_batches.find_one(
        {"userId": user_oid},
        sort=[("createdAt", -1)]
    )
    
    if not latest_batch:
        return []
    
    # Return only leads from this batch
    return list(db.leads.find({
        "userId": user_oid,
        "batchId": latest_batch["_id"]
    }).sort("createdAt", 1))
