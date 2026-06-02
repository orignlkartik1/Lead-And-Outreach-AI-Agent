from datetime import datetime
from bson.objectid import ObjectId
from config.db import get_db


def create_indexes():
    """Create qualification result collection indexes."""
    db = get_db()
    db.qualification_results.create_index([("userId", 1), ("batchId", 1)])
    db.qualification_results.create_index([("userId", 1), ("leadId", 1), ("batchId", 1)], unique=True)
    db.qualification_results.create_index([("userId", 1), ("createdAt", -1)])


def save_qualification_results(user_id, batch_id, results):
    """
    Save qualification results for leads in a batch.
    
    Args:
        user_id: User ObjectId or string
        batch_id: Batch ObjectId or string
        results: List of qualification result dicts
    
    Returns:
        List of saved documents
    """
    db = get_db()
    user_oid = ObjectId(user_id) if isinstance(user_id, str) else user_id
    batch_oid = ObjectId(batch_id) if isinstance(batch_id, str) else batch_id
    now = datetime.utcnow()
    
    saved_ids = []
    
    for result in results:
        try:
            lead_oid = ObjectId(result.get("lead_id"))
            doc = {
                "userId": user_oid,
                "batchId": batch_oid,
                "leadId": lead_oid,
                "score": result.get("score", 0),
                "status": result.get("status", "rejected"),
                "color": result.get("color", "red"),
                "qualificationReason": result.get("qualification_reason", ""),
                "strengths": result.get("strengths", []),
                "weaknesses": result.get("weaknesses", []),
                "recommendedAction": result.get("recommended_action", ""),
                "priorityLevel": result.get("priority_level", "low"),
                "aiGeneratedReasoning": result.get("ai_reasoning", ""),
                "updatedAt": now,
            }
            
            # Use replace_one with upsert to avoid $set issues with datetime
            result_obj = db.qualification_results.replace_one(
                {
                    "userId": user_oid,
                    "leadId": lead_oid,
                    "batchId": batch_oid
                },
                {**doc, "createdAt": now},  # Include createdAt when inserting new
                upsert=True
            )
            saved_ids.append(result_obj.upserted_id or lead_oid)

            # Also update the lead document so UI can show qualification status and reasoning.
            db.leads.update_one(
                {"_id": lead_oid, "userId": user_oid, "batchId": batch_oid},
                {
                    "$set": {
                        "status": doc["status"],
                        "qualified": doc["status"] != "rejected",
                        "score": doc["score"],
                        "qualificationReason": doc["qualificationReason"],
                        "strengths": doc["strengths"],
                        "weaknesses": doc["weaknesses"],
                        "recommendedAction": doc["recommendedAction"],
                        "priorityLevel": doc["priorityLevel"],
                        "aiGeneratedReasoning": doc["aiGeneratedReasoning"],
                        "updatedAt": now,
                    }
                },
            )
            
        except Exception as e:
            print(f"Error saving result for lead {result.get('lead_id')}: {e}")
    
    return list(db.qualification_results.find({
        "userId": user_oid,
        "batchId": batch_oid
    }))


def get_qualification_results(user_id, batch_id):
    """Fetch qualification results for a batch."""
    db = get_db()
    return list(db.qualification_results.find({
        "userId": ObjectId(user_id),
        "batchId": ObjectId(batch_id)
    }))


def sanitize_qualification_result(doc):
    """Sanitize qualification result document."""
    if not doc:
        return None
    
    return {
        "id": str(doc.get("_id")),
        "leadId": str(doc.get("leadId")),
        "score": doc.get("score", 0),
        "status": doc.get("status", "rejected"),
        "color": doc.get("color", "red"),
        "qualificationReason": doc.get("qualificationReason", ""),
        "strengths": doc.get("strengths", []),
        "weaknesses": doc.get("weaknesses", []),
        "recommendedAction": doc.get("recommendedAction", ""),
        "priorityLevel": doc.get("priorityLevel", "low"),
        "aiGeneratedReasoning": doc.get("aiGeneratedReasoning", ""),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }
