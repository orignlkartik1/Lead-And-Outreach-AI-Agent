from datetime import datetime
from bson.objectid import ObjectId
from config.db import get_db


def create_indexes():
    """Create MongoDB indexes for email collections."""
    db = get_db()
    
    # Email campaigns indexes
    db.emailCampaigns.create_index([("userId", 1), ("createdAt", -1)])
    db.emailCampaigns.create_index([("userId", 1), ("status", 1)])
    
    # Email history indexes
    db.emailHistory.create_index([("userId", 1), ("sentAt", -1)])
    db.emailHistory.create_index([("leadId", 1), ("sentAt", -1)])
    db.emailHistory.create_index([("campaignId", 1)])
    
    # Email templates indexes
    db.emailTemplates.create_index([("userId", 1), ("templateType", 1)])
    
    # Follow-up sequences
    db.followUpSequences.create_index([("userId", 1), ("status", 1)])
    db.followUpSequences.create_index([("leadId", 1), ("scheduledFor", 1)])


def save_email_template(
    user_id: str,
    template_type: str,
    subject: str,
    body: str,
    description: str = None
) -> dict:
    """Save an email template."""
    db = get_db()
    
    template = {
        "userId": user_id,
        "templateType": template_type,
        "subject": subject,
        "body": body,
        "description": description,
        "createdAt": datetime.utcnow(),
    }
    
    result = db.emailTemplates.insert_one(template)
    template["_id"] = result.inserted_id
    return template


def get_email_templates(user_id: str, template_type: str = None) -> list:
    """Retrieve email templates."""
    db = get_db()
    
    query = {"userId": user_id}
    if template_type:
        query["templateType"] = template_type
    
    templates = list(db.emailTemplates.find(query))
    for template in templates:
        template["_id"] = str(template["_id"])
    
    return templates


def get_email_history(user_id: str, lead_id: str = None, campaign_id: str = None) -> list:
    """Retrieve email history."""
    db = get_db()
    
    query = {"userId": user_id}
    if lead_id:
        query["leadId"] = lead_id
    if campaign_id:
        query["campaignId"] = campaign_id
    
    history = list(db.emailHistory.find(query).sort("sentAt", -1))
    for record in history:
        record["_id"] = str(record["_id"])
    
    return history


def create_follow_up_sequence(
    user_id: str,
    lead_id: str,
    campaign_id: str,
    sequence: list
) -> dict:
    """
    Create a follow-up sequence for a lead.
    
    Sequence format:
    [
        {"step": 1, "delay_days": 0, "subject": "...", "body": "..."},
        {"step": 2, "delay_days": 3, "subject": "...", "body": "..."},
    ]
    """
    db = get_db()
    
    follow_up = {
        "userId": user_id,
        "leadId": lead_id,
        "campaignId": campaign_id,
        "sequence": sequence,
        "currentStep": 0,
        "status": "scheduled",
        "createdAt": datetime.utcnow(),
    }
    
    result = db.followUpSequences.insert_one(follow_up)
    follow_up["_id"] = result.inserted_id
    return follow_up


def get_pending_follow_ups(user_id: str) -> list:
    """Get pending follow-ups due to be sent."""
    db = get_db()
    now = datetime.utcnow()
    
    pending = list(db.followUpSequences.find({
        "userId": user_id,
        "status": "scheduled",
        "scheduledFor": {"$lte": now}
    }))
    
    for item in pending:
        item["_id"] = str(item["_id"])
    
    return pending


def update_follow_up_status(follow_up_id: str, status: str) -> bool:
    """Update follow-up sequence status."""
    db = get_db()
    
    result = db.followUpSequences.update_one(
        {"_id": ObjectId(follow_up_id)},
        {"$set": {"status": status, "updatedAt": datetime.utcnow()}}
    )
    
    return result.modified_count > 0


def get_campaign_stats(campaign_id: str) -> dict:
    """Get statistics for a campaign."""
    db = get_db()
    
    history = list(db.emailHistory.find({"campaignId": campaign_id}))
    
    stats = {
        "total_sent": len(history),
        "bounced": sum(1 for h in history if h.get("status") == "bounced"),
        "opened": sum(1 for h in history if h.get("opened")),
        "clicked": sum(1 for h in history if h.get("clicked")),
    }
    
    if stats["total_sent"] > 0:
        stats["open_rate"] = round(stats["opened"] / stats["total_sent"] * 100, 2)
        stats["click_rate"] = round(stats["clicked"] / stats["total_sent"] * 100, 2)
    else:
        stats["open_rate"] = 0
        stats["click_rate"] = 0
    
    return stats
