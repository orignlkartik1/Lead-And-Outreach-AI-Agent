from flask import Blueprint, request, jsonify
from middleware.authMiddleware import require_auth
from Services.emailService import EmailService
from models.emailModel import (
    save_email_template, 
    get_email_templates, 
    get_email_history, 
    create_follow_up_sequence,
    get_campaign_stats
)
from bson.objectid import ObjectId
import os

email_bp = Blueprint('email', __name__, url_prefix='/email')


@email_bp.route('/send', methods=['POST'])
@require_auth
def send_email(current_user):
    """Send a single email to a lead."""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('to_email'):
            return jsonify({"error": "to_email is required"}), 400
        if not data.get('subject'):
            return jsonify({"error": "subject is required"}), 400
        if not data.get('body'):
            return jsonify({"error": "body is required"}), 400
        
        email_service = EmailService(current_user['_id'])
        result = email_service.send_email(
            to_email=data['to_email'],
            subject=data['subject'],
            body=data['body'],
            lead_id=data.get('lead_id'),
            campaign_id=data.get('campaign_id')
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/compose', methods=['POST'])
@require_auth
def compose_email(current_user):
    """Compose a personalized email using AI agents."""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('lead_id'):
            return jsonify({"error": "lead_id is required"}), 400
        
        from config.db import get_db
        db = get_db()
        
        # Get lead from database
        lead = db.leads.find_one({
            "_id": ObjectId(data['lead_id']),
            "userId": str(current_user['_id'])
        })
        
        if not lead:
            return jsonify({"error": "Lead not found"}), 404
        
        email_service = EmailService(str(current_user['_id']))
        
        # Compose email
        company_info = data.get('company_info', {})
        sequence_step = data.get('sequence_step', 1)
        
        result = email_service.compose_email(lead, company_info, sequence_step)
        
        return jsonify({
            "success": True,
            "composition": result
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/campaigns', methods=['POST'])
@require_auth
def create_campaign(current_user):
    """Create an email campaign."""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Campaign name is required"}), 400
        if not data.get('target_lead_ids'):
            return jsonify({"error": "Target lead IDs are required"}), 400
        
        email_service = EmailService(str(current_user['_id']))
        
        campaign = email_service.create_campaign(
            name=data['name'],
            template_type=data.get('template_type', 'custom'),
            target_lead_ids=data['target_lead_ids'],
            company_info=data.get('company_info', {}),
            scheduled_at=data.get('scheduled_at')
        )
        
        return jsonify({
            "success": True,
            "campaign": {
                "campaign_id": str(campaign["_id"]),
                "name": campaign["name"],
                "status": campaign["status"],
                "target_count": len(campaign["targetLeads"]),
                "created_at": campaign["createdAt"].isoformat()
            }
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/campaigns/<campaign_id>/launch', methods=['POST'])
@require_auth
def launch_campaign(current_user, campaign_id):
    """Launch a campaign and start sending emails."""
    try:
        email_service = EmailService(str(current_user['_id']))
        result = email_service.launch_campaign(campaign_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/campaigns', methods=['GET'])
@require_auth
def list_campaigns(current_user):
    """List all email campaigns for the user."""
    try:
        email_service = EmailService(str(current_user['_id']))
        campaigns = email_service.get_campaign_history()
        
        return jsonify({
            "success": True,
            "campaigns": campaigns
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/campaigns/<campaign_id>', methods=['GET'])
@require_auth
def get_campaign(current_user, campaign_id):
    """Get campaign details and stats."""
    try:
        email_service = EmailService(str(current_user['_id']))
        campaigns = email_service.get_campaign_history(campaign_id)
        
        if not campaigns:
            return jsonify({"error": "Campaign not found"}), 404
        
        campaign = campaigns[0]
        stats = get_campaign_stats(campaign_id)
        
        return jsonify({
            "success": True,
            "campaign": campaign,
            "stats": stats
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/history', methods=['GET'])
@require_auth
def get_email_history_endpoint(current_user):
    """Get email sending history."""
    try:
        lead_id = request.args.get('lead_id')
        campaign_id = request.args.get('campaign_id')
        
        history = get_email_history(
            str(current_user['_id']),
            lead_id=lead_id,
            campaign_id=campaign_id
        )
        
        return jsonify({
            "success": True,
            "history": history,
            "count": len(history)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/templates', methods=['POST'])
@require_auth
def save_template(current_user):
    """Save an email template."""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('template_type'):
            return jsonify({"error": "template_type is required"}), 400
        if not data.get('subject'):
            return jsonify({"error": "subject is required"}), 400
        if not data.get('body'):
            return jsonify({"error": "body is required"}), 400
        
        template = save_email_template(
            user_id=str(current_user['_id']),
            template_type=data['template_type'],
            subject=data['subject'],
            body=data['body'],
            description=data.get('description')
        )
        
        return jsonify({
            "success": True,
            "template": {
                "template_id": str(template["_id"]),
                "template_type": template["template_type"],
                "created_at": template["createdAt"].isoformat()
            }
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/templates', methods=['GET'])
@require_auth
def list_templates(current_user):
    """List email templates."""
    try:
        template_type = request.args.get('template_type')
        templates = get_email_templates(str(current_user['_id']), template_type)
        
        return jsonify({
            "success": True,
            "templates": templates,
            "count": len(templates)
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@email_bp.route('/test-smtp', methods=['GET'])
@require_auth
def test_smtp_connection(current_user):
    """Test SMTP connection configuration."""
    try:
        import smtplib
        
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if not all([smtp_host, smtp_user, smtp_password]):
            return jsonify({
                "success": False,
                "error": "SMTP credentials not configured"
            }), 400
        
        try:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
            
            return jsonify({
                "success": True,
                "message": "SMTP connection successful"
            }), 200
        
        except smtplib.SMTPAuthenticationError:
            return jsonify({
                "success": False,
                "error": "SMTP authentication failed"
            }), 400
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"SMTP connection failed: {str(e)}"
            }), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
