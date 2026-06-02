"""
BACKEND DEPLOYMENT & CONFIGURATION GUIDE
AI Lead Qualification System
"""

"""
========================================
ENVIRONMENT SETUP
========================================

1. INSTALL DEPENDENCIES:
   pip install -r requirements.txt

2. CONFIGURE ENVIRONMENT VARIABLES (.env):
   - MONGO_URI: MongoDB connection string
   - JWT_SECRET: Secret key for JWT tokens
   - JWT_ALGORITHM: HS256 (default)
   - CORS_ORIGINS: Comma-separated list of allowed origins
   - OPENAI_API_KEY: Required for CrewAI qualification (get from OpenAI)
   - FLASK_ENV: development or production
   - FLASK_DEBUG: True or False

3. VERIFY MONGODB:
   - Collections auto-created: users, leads, lead_batches, icp_profiles, qualification_results
   - Indexes automatically created on startup

========================================
API ENDPOINTS REFERENCE
========================================

ICP PROFILE MANAGEMENT:
- POST /icp/profile - Save/update active ICP profile
- GET /icp/profile - Fetch active ICP profile

LEAD UPLOAD & QUALIFICATION:
- POST /leads/upload - Upload CSV file
- GET /leads - Get leads (with optional ?batchId=)
- POST /leads/batches/<batch_id>/qualify - Run qualification (processes ONLY latest batch)
- GET /leads/batches/<batch_id>/results - Get qualification results

ASYNC QUALIFICATION (for long-running tasks):
- POST /async/qualify/start?batchId=<id> - Start async job
- GET /async/qualify/status?jobId=<id> - Poll job status
- POST /async/jobs/cleanup?hours=24 - Clean old jobs

========================================
QUALIFICATION WORKFLOW
========================================

STEP 1: User uploads CSV file
POST /leads/upload with multipart form data

Response:
{
  "batch": { "id", "fileName", "status": "preview", "stats": {...} },
  "leads": [...]
}

STEP 2: User configures ICP profile
POST /icp/profile with JSON body:
{
  "projectIndustry": "SaaS",
  "productName": "LeadFlow AI",
  "productDescription": "AI-powered lead qualification...",
  "productCapabilities": ["Lead Scoring", "AI Qualification"],
  "idealCompanies": "Salesforce, HubSpot, Slack...",
  "selectedIndustries": ["SaaS", "FinTech"],
  "selectedRoles": ["CEO", "VP Sales"],
  "companySize": "51-200",
  "selectedTechStacks": ["Salesforce", "AWS"],
  "fundingStage": "Series A",
  "locations": ["USA"],
  "recentTriggerEvents": "Raised funding..."
}

STEP 3: Run qualification
Option A - SYNC (shorter batches):
POST /leads/batches/<batch_id>/qualify

Option B - ASYNC (longer batches):
POST /async/qualify/start?batchId=<batch_id>
Returns: { "job_id": "...", "status": "pending" }

Then poll:
GET /async/qualify/status?jobId=<job_id>

STEP 4: Fetch results
GET /leads/batches/<batch_id>/results

Response:
{
  "results": [
    {
      "leadId": "...",
      "score": 85,
      "status": "strong_qualified",
      "color": "green",
      "strengths": [...],
      "weaknesses": [...],
      "recommendedAction": "Contact immediately",
      "priorityLevel": "high",
      "aiGeneratedReasoning": "..."
    }
  ]
}

========================================
CRITICAL ARCHITECTURE NOTES
========================================

1. LATEST BATCH ONLY:
   - qualify_leads() ONLY processes the most recently uploaded batch
   - Uses get_latest_batch_leads() function
   - Never mixes old datasets with new uploads
   - Ensures data integrity and accuracy

2. MONGODB SCHEMA:
   
   leads collection:
   {
     _id: ObjectId,
     userId: ObjectId,
     batchId: ObjectId,
     uploadBatchId: String (optional),
     uploadedAt: ISODate,
     name, company, role, industry, email,
     employeeCount, companyTechStack,
     fundingStage, location, recentTriggerEvent,
     status: "preview|qualified|rejected",
     qualified: boolean,
     score: number
   }

   lead_batches collection:
   {
     _id: ObjectId,
     userId: ObjectId,
     fileName: String,
     status: "preview|qualified",
     stats: { uploadedRows, savedRows, duplicateRows },
     createdAt: ISODate,
     updatedAt: ISODate
   }

   icp_profiles collection:
   {
     _id: ObjectId,
     userId: ObjectId,
     active: boolean,
     projectIndustry, productName, productDescription,
     productCapabilities, idealCompanies,
     targetIndustries, targetRoles, targetCompanySize,
     targetTechStack, targetFundingStage, targetLocations,
     recentTriggerEvents,
     createdAt, updatedAt
   }

   qualification_results collection:
   {
     _id: ObjectId,
     userId: ObjectId,
     batchId: ObjectId,
     leadId: ObjectId,
     score: number,
     status: "strong_qualified|moderate|rejected",
     color: "green|yellow|red",
     qualificationReason: String,
     strengths: [String],
     weaknesses: [String],
     recommendedAction: String,
     priorityLevel: "high|medium|low",
     aiGeneratedReasoning: String,
     createdAt, updatedAt
   }

3. SCORING SYSTEM:
   - Industry Match: 20 points
   - Company Size Match: 20 points
   - Tech Stack Match: 20 points
   - Decision Maker Match: 15 points
   - Funding Stage Match: 15 points
   - Recent Trigger Match: 10 points
   - Total: 100 points

4. STATUS CLASSIFICATION:
   - score >= 80: "strong_qualified" (green) - High priority
   - score 70-79: "moderate" (yellow) - Medium priority
   - score < 70: "rejected" (red) - Low priority

========================================
CREWAI INTEGRATION
========================================

Two AI Agents work together:

1. Lead Qualification Expert:
   - Role: Evaluate lead against ICP
   - Analyzes: Company fit, role match, industry alignment
   - Output: Preliminary scoring

2. Lead Scoring Analyst:
   - Role: Detailed scoring breakdown
   - Analyzes: Weighted criteria and justification
   - Output: Final score and reasoning

FALLBACK MECHANISM:
- If CrewAI fails (API issues, LLM timeout)
- Falls back to rule-based scoring (qualificationHelper.py)
- Ensures leads are still qualified
- Marks result as "used_ai: false"

========================================
PERFORMANCE OPTIMIZATION
========================================

1. Batch Processing:
   - Processes leads sequentially by default
   - Consider parallel processing for large batches (100+ leads)
   - Use async endpoint for 50+ lead batches

2. MongoDB Indexing:
   - Indexes auto-created in init_db()
   - userId + batchId for fast lookups
   - userId + createdAt for sorting

3. Memory Management:
   - Async job cleanup removes jobs older than 24 hours
   - Use cleanup_jobs() endpoint to manually trigger
   - For production, consider Redis for session storage

========================================
PRODUCTION DEPLOYMENT CHECKLIST
========================================

□ Update CORS_ORIGINS with production domain
□ Set FLASK_ENV=production
□ Set FLASK_DEBUG=False
□ Use production MongoDB URI (Atlas or self-hosted)
□ Set strong JWT_SECRET
□ Configure OPENAI_API_KEY for production account
□ Set up error logging and monitoring
□ Enable HTTPS for all API calls
□ Implement rate limiting on qualification endpoint
□ Set up background job queue (Redis + Celery) for async tasks
□ Configure email notifications for qualification completion
□ Set up backups for MongoDB
□ Test end-to-end qualification pipeline

========================================
TROUBLESHOOTING
========================================

OPENAI_API_KEY not found:
- Check .env file has OPENAI_API_KEY
- Ensure value is correct from OpenAI dashboard
- Falls back to rule-based scoring if not available

MongoDB connection failed:
- Verify MONGO_URI is correct
- Check MongoDB service is running
- Ensure network access if using Atlas

Qualification taking too long:
- Use async endpoint for large batches
- Check OpenAI API status/rate limits
- Review network latency to MongoDB

JSON parsing errors in qualification:
- Check CrewAI output format
- Fallback to rule-based scoring is working
- Review agent prompts if consistently failing

========================================
MONITORING & LOGGING
========================================

Key metrics to monitor:
- Average qualification time per lead
- Success rate of qualification jobs
- CrewAI vs fallback scoring ratio
- MongoDB query performance
- API response times

Logs to track:
- Batch upload size and processing time
- Qualification job start/completion
- ICP profile updates
- Error rates and types

========================================
"""
