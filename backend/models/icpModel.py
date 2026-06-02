from datetime import datetime
from bson.objectid import ObjectId
from config.db import get_db


def create_indexes():
    """Create ICP collection indexes."""
    db = get_db()
    db.icp_profiles.create_index([("userId", 1), ("active", 1)])
    db.icp_profiles.create_index([("userId", 1), ("createdAt", -1)])


def create_or_update_icp(user_id, icp_data):
    """
    Create or update ICP profile for user.
    Only one active ICP profile per user.
    Supports both custom text ICP and structured ICP formats.
    """
    db = get_db()
    user_oid = ObjectId(user_id)
    now = datetime.utcnow()
    
    # Deactivate other active profiles
    db.icp_profiles.update_many(
        {"userId": user_oid, "active": True},
        {"$set": {"active": False, "updatedAt": now}}
    )
    
    # Support custom ICP text and structured ICP fields together
    icp_doc = {
        "userId": user_oid,
        "active": True,
        "customIcp": icp_data.get("customIcp", ""),
        "projectIndustry": icp_data.get("projectIndustry", ""),
        "productName": icp_data.get("productName", ""),
        "productDescription": icp_data.get("productDescription", ""),
        "productCapabilities": icp_data.get("productCapabilities", []),
        "idealCompanies": icp_data.get("idealCompanies", ""),
        "preferredDepartments": icp_data.get("preferredDepartments", []),
        "targetIndustries": icp_data.get("targetIndustries", icp_data.get("selectedIndustries", [])),
        "targetRoles": icp_data.get("targetRoles", icp_data.get("selectedRoles", [])),
        "targetCompanySize": icp_data.get("targetCompanySize", icp_data.get("companySize", "")),
        "companySizeMin": icp_data.get("companySizeMin"),
        "companySizeMax": icp_data.get("companySizeMax"),
        "targetTechStack": icp_data.get("targetTechStack", icp_data.get("selectedTechStacks", [])),
        "targetFundingStage": icp_data.get("targetFundingStage", icp_data.get("fundingStage", "")),
        "targetLocations": icp_data.get("targetLocations", icp_data.get("locations", [])),
        "targetCurrentlyHiring": icp_data.get("targetCurrentlyHiring", ""),
        "recentTriggerEvents": icp_data.get("recentTriggerEvents", ""),
        "updatedAt": now,
    }
    
    result = db.icp_profiles.update_one(
        {"userId": user_oid, "active": True},
        {"$set": icp_doc, "$setOnInsert": {"createdAt": now}},
        upsert=True
    )
    
    # Fetch and return the updated document
    return db.icp_profiles.find_one({"_id": result.upserted_id if result.upserted_id else ObjectId()}) or \
           db.icp_profiles.find_one({"userId": user_oid, "active": True})


def get_active_icp(user_id):
    """Fetch active ICP profile for user."""
    db = get_db()
    return db.icp_profiles.find_one({
        "userId": ObjectId(user_id),
        "active": True
    })


def sanitize_icp_doc(doc):
    """Sanitize ICP document for API response."""
    if not doc:
        return None
    
    sanitized = {
        "id": str(doc.get("_id")),
        "customIcp": doc.get("customIcp", ""),
        "projectIndustry": doc.get("projectIndustry", ""),
        "productName": doc.get("productName", ""),
        "productDescription": doc.get("productDescription", ""),
        "productCapabilities": doc.get("productCapabilities", []),
        "idealCompanies": doc.get("idealCompanies", ""),
        "preferredDepartments": doc.get("preferredDepartments", []),
        "targetIndustries": doc.get("targetIndustries", []),
        "targetRoles": doc.get("targetRoles", []),
        "targetCompanySize": doc.get("targetCompanySize", ""),
        "companySizeMin": doc.get("companySizeMin"),
        "companySizeMax": doc.get("companySizeMax"),
        "targetTechStack": doc.get("targetTechStack", []),
        "targetFundingStage": doc.get("targetFundingStage", ""),
        "targetLocations": doc.get("targetLocations", []),
        "targetCurrentlyHiring": doc.get("targetCurrentlyHiring", ""),
        "recentTriggerEvents": doc.get("recentTriggerEvents", ""),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }
    return sanitized
