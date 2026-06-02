from flask import Blueprint
from controllers.icpController import save_icp_profile, get_icp_profile
from middleware.authMiddleware import require_auth


icp_bp = Blueprint("icp", __name__, url_prefix="/icp")


@icp_bp.route("/profile", methods=["POST"])
@require_auth
def route_save_icp():
    """Save or update active ICP profile."""
    return save_icp_profile()


@icp_bp.route("/profile", methods=["GET"])
@require_auth
def route_get_icp():
    """Fetch active ICP profile."""
    return get_icp_profile()
