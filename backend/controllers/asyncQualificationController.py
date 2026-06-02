"""Controller for async lead qualification jobs."""

import traceback
from flask import request, jsonify, g
from Services.asyncJobHandler import (
    run_qualification_async,
    get_qualification_job,
    cleanup_old_jobs,
)


def start_qualification_job():
    """
    Start an async lead qualification job.
    
    Returns immediately with job_id for polling.
    """
    try:
        batch_id = request.args.get("batchId")
        
        # Start async job
        job = run_qualification_async(g.current_user["id"], batch_id)
        
        return jsonify({
            "success": True,
            "job_id": job.job_id,
            "status": job.status,
            "message": "Qualification job started. Poll for status updates."
        }), 202
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to start job: {str(e)}"}), 500


def get_job_status():
    """
    Poll the status of a qualification job.
    """
    try:
        job_id = request.args.get("jobId")
        if not job_id:
            return jsonify({"error": "jobId query parameter required"}), 400
        
        job = get_qualification_job(job_id)
        if not job:
            return jsonify({"error": "Job not found"}), 404
        
        # Verify user owns this job
        if job.user_id != g.current_user["id"]:
            return jsonify({"error": "Unauthorized"}), 403
        
        return jsonify({
            "success": True,
            "job": job.to_dict(),
            "results": job.results if job.status == "completed" else None,
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Failed to get job: {str(e)}"}), 500


def cleanup_jobs():
    """
    Manual cleanup of old jobs (admin only).
    """
    try:
        hours = int(request.args.get("hours", 24))
        deleted = cleanup_old_jobs(hours)
        
        return jsonify({
            "success": True,
            "deleted_jobs": deleted,
            "message": f"Cleaned up {deleted} jobs older than {hours} hours"
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Cleanup failed: {str(e)}"}), 500
