"""
Complete Email Agent Integration Examples
This file shows how to use the email agent with the qualification pipeline
"""

# Example 1: Send Email to Single Qualified Lead
# ================================================

def send_email_to_lead(user_id, lead_id, company_info):
    """Send a personalized email to a qualified lead."""
    from Services.emailService import EmailService
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    # Get lead from database
    lead = db.leads.find_one({
        "_id": ObjectId(lead_id),
        "userId": user_id
    })
    
    if not lead or not lead.get("email"):
        return {"success": False, "error": "Lead not found or no email"}
    
    # Compose personalized email
    email_content = email_service.compose_email(lead, company_info)
    
    # Send email
    result = email_service.send_email(
        to_email=lead["email"],
        subject=email_content["subject_line"],
        body=email_content["email_body"],
        lead_id=str(lead["_id"])
    )
    
    return {
        "success": result["success"],
        "lead": lead["name"],
        "email": lead["email"],
        "subject": email_content["subject_line"],
        "message": result.get("message", result.get("error"))
    }


# Example 2: Create Campaign from Qualified Leads
# ===============================================

def create_outreach_campaign(user_id, batch_id, company_info, min_score=70):
    """
    Create an email campaign for all strongly qualified leads.
    
    Args:
        user_id: Current user ID
        batch_id: Lead batch ID
        company_info: Your company details for personalization
        min_score: Minimum qualification score (0-100)
    
    Returns:
        Campaign details
    """
    from Services.emailService import EmailService
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    # Get all qualified leads from batch
    qualified_leads = db.leads.find({
        "userId": user_id,
        "batchId": ObjectId(batch_id),
        "score": {"$gte": min_score},
        "email": {"$exists": True, "$ne": ""}
    })
    
    lead_ids = [str(lead["_id"]) for lead in qualified_leads]
    
    if not lead_ids:
        return {"success": False, "error": "No qualified leads found"}
    
    # Create campaign
    campaign = email_service.create_campaign(
        name=f"Outreach: {company_info['name']} - {len(lead_ids)} Leads",
        template_type="custom",
        target_lead_ids=lead_ids,
        company_info=company_info
    )
    
    return {
        "success": True,
        "campaign_id": str(campaign["_id"]),
        "campaign_name": campaign["name"],
        "target_leads": len(lead_ids),
        "status": campaign["status"]
    }


# Example 3: Launch Campaign and Track Results
# =============================================

def launch_and_monitor_campaign(user_id, campaign_id):
    """
    Launch a campaign and get real-time results.
    
    Args:
        user_id: Current user ID
        campaign_id: Campaign ID to launch
    
    Returns:
        Campaign launch status and results
    """
    from Services.emailService import EmailService
    from models.emailModel import get_campaign_stats
    
    email_service = EmailService(user_id)
    
    # Launch campaign
    launch_result = email_service.launch_campaign(campaign_id)
    
    if not launch_result["success"]:
        return launch_result
    
    # Get campaign stats
    stats = get_campaign_stats(campaign_id)
    
    return {
        "success": True,
        "campaign_id": campaign_id,
        "emails_sent": launch_result["total_sent"],
        "results": launch_result["results"],
        "stats": stats
    }


# Example 4: Send Follow-up Emails
# ================================

def send_follow_up_sequence(user_id, campaign_id):
    """
    Send follow-up emails to leads that didn't respond.
    
    Args:
        user_id: Current user ID
        campaign_id: Original campaign ID
    
    Returns:
        Follow-up campaign results
    """
    from Services.emailService import EmailService
    from models.emailModel import get_email_history
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    # Get original campaign
    campaign = db.emailCampaigns.find_one({
        "_id": ObjectId(campaign_id),
        "userId": user_id
    })
    
    if not campaign:
        return {"success": False, "error": "Campaign not found"}
    
    # Get leads that were emailed in original campaign
    email_history = get_email_history(user_id, campaign_id=campaign_id)
    lead_ids = [h["leadId"] for h in email_history]
    
    # Create follow-up campaign (step 2)
    follow_up_campaign = email_service.create_campaign(
        name=f"Follow-up: {campaign['name']} - Day 3",
        template_type="custom",
        target_lead_ids=lead_ids,
        company_info=campaign.get("companyInfo", {})
    )
    
    # Launch follow-up
    db.emailCampaigns.update_one(
        {"_id": ObjectId(follow_up_campaign["_id"])},
        {"$set": {"parentCampaign": campaign_id, "sequenceStep": 2}}
    )
    
    return {
        "success": True,
        "original_campaign": campaign_id,
        "follow_up_campaign": str(follow_up_campaign["_id"]),
        "leads_to_follow_up": len(lead_ids),
        "message": "Follow-up campaign created. Call launch to send emails."
    }


# Example 5: Qualification → Email Workflow
# ==========================================

def auto_email_qualified_leads(user_id, batch_id, company_info, auto_launch=False):
    """
    End-to-end workflow: Get qualified leads and email them automatically.
    
    Args:
        user_id: Current user ID
        batch_id: Lead batch ID
        company_info: Your company details
        auto_launch: If True, automatically launch campaign
    
    Returns:
        Complete workflow result
    """
    from Services.emailService import EmailService
    from models.emailModel import get_campaign_stats
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    # Step 1: Get strongly qualified leads
    strong_leads = list(db.leads.find({
        "userId": user_id,
        "batchId": ObjectId(batch_id),
        "status": "strong_qualified",
        "email": {"$exists": True, "$ne": ""}
    }))
    
    if not strong_leads:
        return {
            "success": False,
            "error": "No strongly qualified leads found",
            "qualified_count": 0
        }
    
    # Step 2: Create campaign
    lead_ids = [str(lead["_id"]) for lead in strong_leads]
    campaign = email_service.create_campaign(
        name=f"Auto-Outreach: {company_info.get('name', 'Campaign')} ({len(lead_ids)} leads)",
        template_type="custom",
        target_lead_ids=lead_ids,
        company_info=company_info
    )
    
    result = {
        "workflow": "Qualification → Email",
        "step_1_qualified_leads": {
            "count": len(strong_leads),
            "leads": [{"name": l["name"], "email": l["email"]} for l in strong_leads]
        },
        "step_2_campaign_created": {
            "campaign_id": str(campaign["_id"]),
            "name": campaign["name"],
            "status": campaign["status"]
        }
    }
    
    # Step 3: Launch campaign if requested
    if auto_launch:
        launch_result = email_service.launch_campaign(str(campaign["_id"]))
        stats = get_campaign_stats(str(campaign["_id"]))
        
        result["step_3_campaign_launched"] = {
            "success": launch_result["success"],
            "emails_sent": launch_result["total_sent"],
            "stats": stats
        }
    else:
        result["step_3_campaign_launched"] = {
            "message": "Campaign ready to launch. Call /email/campaigns/{id}/launch to send emails."
        }
    
    return result


# Example 6: Custom Template Email
# ================================

def send_custom_email_campaign(user_id, lead_ids, subject_template, body_template, company_info):
    """
    Send emails using custom templates.
    
    Args:
        user_id: Current user ID
        lead_ids: List of lead IDs to email
        subject_template: Subject line (can have {lead_name}, {company}, etc.)
        body_template: Email body (can have {lead_name}, {company}, etc.)
        company_info: Company details for personalization
    
    Returns:
        Campaign results
    """
    from Services.emailService import EmailService
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    results = []
    
    for lead_id in lead_ids:
        lead = db.leads.find_one({
            "_id": ObjectId(lead_id),
            "userId": user_id
        })
        
        if not lead or not lead.get("email"):
            results.append({
                "lead_id": lead_id,
                "success": False,
                "error": "Lead not found or missing email"
            })
            continue
        
        # Personalize template
        subject = subject_template.format(
            lead_name=lead.get("name", ""),
            company=lead.get("company", ""),
            role=lead.get("role", "")
        )
        
        body = body_template.format(
            lead_name=lead.get("name", ""),
            company=lead.get("company", ""),
            role=lead.get("role", ""),
            industry=lead.get("industry", "")
        )
        
        # Send email
        result = email_service.send_email(
            to_email=lead["email"],
            subject=subject,
            body=body,
            lead_id=str(lead["_id"])
        )
        
        results.append({
            "lead_id": lead_id,
            "lead_name": lead.get("name"),
            "email": lead["email"],
            "success": result["success"],
            "message": result.get("message", result.get("error"))
        })
    
    successful = sum(1 for r in results if r["success"])
    
    return {
        "success": True,
        "total": len(results),
        "successful": successful,
        "failed": len(results) - successful,
        "results": results
    }


# Example 7: Batch Email to Leads with Retry
# ===========================================

def send_emails_with_retry(user_id, lead_ids, email_content, max_retries=3):
    """
    Send emails to multiple leads with retry logic.
    
    Args:
        user_id: Current user ID
        lead_ids: List of lead IDs
        email_content: Dict with 'subject' and 'body'
        max_retries: Number of retries for failed sends
    
    Returns:
        Detailed results with retry stats
    """
    from Services.emailService import EmailService
    from config.db import get_db
    from bson.objectid import ObjectId
    
    db = get_db()
    email_service = EmailService(user_id)
    
    results = {
        "total": len(lead_ids),
        "successful": 0,
        "failed": 0,
        "retried": [],
        "details": []
    }
    
    for lead_id in lead_ids:
        lead = db.leads.find_one({
            "_id": ObjectId(lead_id),
            "userId": user_id
        })
        
        if not lead or not lead.get("email"):
            results["failed"] += 1
            results["details"].append({
                "lead_id": lead_id,
                "error": "Lead not found or missing email"
            })
            continue
        
        # Try sending with retries
        attempt = 0
        success = False
        last_error = None
        
        while attempt < max_retries and not success:
            attempt += 1
            result = email_service.send_email(
                to_email=lead["email"],
                subject=email_content["subject"],
                body=email_content["body"],
                lead_id=str(lead["_id"])
            )
            
            success = result["success"]
            last_error = result.get("error")
        
        if success:
            results["successful"] += 1
            results["details"].append({
                "lead_id": lead_id,
                "lead_name": lead.get("name"),
                "email": lead["email"],
                "attempts": attempt,
                "status": "sent"
            })
        else:
            results["failed"] += 1
            results["retried"].append({
                "lead_id": lead_id,
                "email": lead["email"],
                "attempts": attempt,
                "last_error": last_error
            })
    
    return results


# Example Usage in Flask Route
# =============================

"""
from flask import Blueprint, request, jsonify
from middleware.authMiddleware import require_auth

@bp.route('/api/email/send-to-qualified', methods=['POST'])
@require_auth
def api_send_to_qualified(current_user):
    data = request.json
    
    result = auto_email_qualified_leads(
        user_id=str(current_user['_id']),
        batch_id=data['batch_id'],
        company_info=data['company_info'],
        auto_launch=data.get('auto_launch', False)
    )
    
    return jsonify(result), 200 if result['success'] else 400
"""
