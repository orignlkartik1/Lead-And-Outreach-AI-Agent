"""Routes for async lead qualification jobs."""

from flask import Blueprint
from controllers.asyncQualificationController import (
    start_qualification_job,
    get_job_status,
    cleanup_jobs,
)
from middleware.authMiddleware import require_auth


async_bp = Blueprint("async", __name__, url_prefix="/async")


@async_bp.route("/qualify/start", methods=["POST"])
@require_auth
def route_start_qualification():
    """Start an async qualification job."""
    return start_qualification_job()


@async_bp.route("/qualify/status", methods=["GET"])
@require_auth
def route_get_status():
    """Get status of a qualification job."""
    return get_job_status()


@async_bp.route("/jobs/cleanup", methods=["POST"])
@require_auth
def route_cleanup():
    """Clean up old jobs."""
    return cleanup_jobs()
