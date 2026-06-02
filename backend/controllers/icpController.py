import traceback
from flask import request, jsonify, g
from models.icpModel import create_or_update_icp, get_active_icp, sanitize_icp_doc


def save_icp_profile():
    """Save or update ICP profile for current user."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        target_currently_hiring = str(data.get("targetCurrentlyHiring") or "").strip()
        if not target_currently_hiring:
            return jsonify({"error": "ICP Currently Hiring preference is required."}), 400
        if target_currently_hiring.lower() not in {"yes", "no"}:
            return jsonify({"error": "ICP Currently Hiring must be Yes or No."}), 400
        
        # Create/update ICP in MongoDB
        icp = create_or_update_icp(g.current_user["id"], data)
        
        return jsonify({
            "success": True,
            "icp": sanitize_icp_doc(icp)
        }), 201
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to save ICP profile"}), 500


def get_icp_profile():
    """Fetch active ICP profile for current user."""
    try:
        icp = get_active_icp(g.current_user["id"])
        
        if not icp:
            return jsonify({
                "success": False,
                "icp": None,
                "message": "No active ICP profile found"
            }), 404
        
        return jsonify({
            "success": True,
            "icp": sanitize_icp_doc(icp)
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch ICP profile"}), 500
