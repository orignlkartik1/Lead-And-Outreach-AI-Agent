"""Background job handler for async lead qualification processing."""

import os
import json
import threading
import uuid
from datetime import datetime, timedelta
from config.db import get_db
from bson.objectid import ObjectId


# In-memory job store (for development; use Redis for production)
_jobs = {}
_job_lock = threading.Lock()


class QualificationJob:
    """Represents an async qualification job."""
    
    def __init__(self, user_id: str, batch_id: str = None):
        self.job_id = str(uuid.uuid4())
        self.user_id = user_id
        self.batch_id = batch_id
        self.status = "pending"  # pending, running, completed, failed
        self.progress = 0  # 0-100
        self.results = []
        self.error = None
        self.created_at = datetime.utcnow()
        self.started_at = None
        self.completed_at = None
        self.stats = {}
    
    def to_dict(self):
        """Convert job to dictionary for API response."""
        return {
            "job_id": self.job_id,
            "status": self.status,
            "progress": self.progress,
            "batch_id": self.batch_id,
            "stats": self.stats,
            "results_count": len(self.results),
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


def create_qualification_job(user_id: str, batch_id: str = None) -> QualificationJob:
    """Create a new qualification job."""
    job = QualificationJob(user_id, batch_id)
    
    with _job_lock:
        _jobs[job.job_id] = job
    
    return job


def get_qualification_job(job_id: str) -> QualificationJob:
    """Retrieve a qualification job by ID."""
    with _job_lock:
        return _jobs.get(job_id)


def update_job_progress(job_id: str, progress: int, status: str = None):
    """Update job progress."""
    job = get_qualification_job(job_id)
    if job:
        with _job_lock:
            job.progress = min(100, max(0, progress))
            if status:
                job.status = status
            if status == "running" and not job.started_at:
                job.started_at = datetime.utcnow()
            elif status == "completed":
                job.completed_at = datetime.utcnow()


def complete_qualification_job(job_id: str, results: list, stats: dict):
    """Mark job as completed with results."""
    job = get_qualification_job(job_id)
    if job:
        with _job_lock:
            job.status = "completed"
            job.progress = 100
            job.results = results
            job.stats = stats
            job.completed_at = datetime.utcnow()


def fail_qualification_job(job_id: str, error: str):
    """Mark job as failed with error message."""
    job = get_qualification_job(job_id)
    if job:
        with _job_lock:
            job.status = "failed"
            job.error = error
            job.completed_at = datetime.utcnow()


def run_qualification_async(user_id: str, batch_id: str = None):
    """
    Run qualification in background thread.
    
    Returns job_id that can be polled for status.
    """
    job = create_qualification_job(user_id, batch_id)
    
    # Start async task
    thread = threading.Thread(
        target=_run_qualification_worker,
        args=(job.job_id, user_id, batch_id),
        daemon=True
    )
    thread.start()
    
    return job


def _run_qualification_worker(job_id: str, user_id: str, batch_id: str):
    """Worker function that runs in background thread."""
    try:
        from Services.qualificationService import LeadQualificationService
        
        update_job_progress(job_id, 10, "running")
        
        # Initialize service
        service = LeadQualificationService(user_id)
        
        # Run qualification
        update_job_progress(job_id, 30, "running")
        result = service.qualify_leads(batch_id)
        
        update_job_progress(job_id, 90, "running")
        
        if result.get("success"):
            complete_qualification_job(
                job_id,
                result.get("results", []),
                result.get("stats", {})
            )
        else:
            fail_qualification_job(job_id, result.get("error", "Unknown error"))
    
    except Exception as e:
        print(f"Qualification job {job_id} failed: {e}")
        fail_qualification_job(job_id, str(e))


def cleanup_old_jobs(hours: int = 24):
    """Remove jobs older than specified hours (for memory management)."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    
    with _job_lock:
        expired = [
            job_id for job_id, job in _jobs.items()
            if job.completed_at and job.completed_at < cutoff
        ]
        for job_id in expired:
            del _jobs[job_id]
    
    return len(expired)
