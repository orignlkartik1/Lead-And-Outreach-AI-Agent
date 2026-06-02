from flask import Blueprint
from controllers.leadController import (
    get_leads,
    qualify_batch,
    upload_leads,
    get_qualification_results_for_batch,
)
from middleware.authMiddleware import require_auth


lead_bp = Blueprint("leads", __name__, url_prefix="/leads")


@lead_bp.route("", methods=["GET"])
@require_auth
def route_get_leads():
    return get_leads()


@lead_bp.route("/upload", methods=["POST"])
@require_auth
def route_upload_leads():
    return upload_leads()


@lead_bp.route("/batches/<batch_id>/qualify", methods=["POST"])
@require_auth
def route_qualify_batch(batch_id):
    return qualify_batch(batch_id)


@lead_bp.route("/batches/<batch_id>/results", methods=["GET"])
@require_auth
def route_get_results(batch_id):
    return get_qualification_results_for_batch(batch_id)
