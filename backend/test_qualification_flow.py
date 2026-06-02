#!/usr/bin/env python3
"""Test script to verify ICP and lead qualification flow."""

import os
import sys
from dotenv import load_dotenv
from bson.objectid import ObjectId
from config.db import init_db, get_db
from models.icpModel import create_or_update_icp, get_active_icp
from models.leadModel import get_latest_batch_leads, get_latest_batch
from models.qualificationResultModel import get_qualification_results
from Services.qualificationService import LeadQualificationService

# Load environment variables
load_dotenv()

# Initialize database
init_db()
db = get_db()

print("=" * 70)
print("QUALIFICATION FLOW TEST")
print("=" * 70)

# Get user ID from database
user = db.users.find_one({})
if not user:
    print("\n❌ No user found. Create a user account first.")
    sys.exit(1)

user_id = str(user["_id"])
print(f"\n✓ User ID: {user_id}")

# Check if ICP exists
icp = get_active_icp(user_id)
if not icp:
    print("\n⚠️  No active ICP found. Creating test ICP...")
    icp_data = {
        "projectIndustry": "SaaS",
        "productName": "LeadFlow",
        "productDescription": "AI-powered lead qualification platform",
        "productCapabilities": ["Lead Scoring", "AI Qualification"],
        "idealCompanies": "Tech companies with 51-200 employees",
        "selectedIndustries": ["SaaS"],
        "selectedRoles": ["CEO", "Founder", "CTO"],
        "companySize": "51-200",
        "selectedTechStacks": ["Salesforce", "AWS"],
        "fundingStage": "Series A",
        "locations": ["USA"],
        "recentTriggerEvents": "Raised $5M funding",
    }
    icp = create_or_update_icp(user_id, icp_data)
    print("✓ Test ICP created")
else:
    print(f"✓ Active ICP found: {icp.get('productName', 'Unknown')}")
    print(f"  Industries: {icp.get('targetIndustries')}")
    print(f"  Tech Stack: {icp.get('targetTechStack')}")

# Check if leads exist
latest_batch = get_latest_batch(user_id)
if not latest_batch:
    print("\n❌ No leads batch found. Upload leads first.")
    sys.exit(1)

leads = get_latest_batch_leads(user_id)
print(f"\n✓ Found {len(leads)} leads in batch: {latest_batch.get('fileName')}")
if leads:
    lead = leads[0]
    print(f"  Sample: {lead.get('name')} from {lead.get('company')} ({lead.get('industry')})")

# Run qualification
print("\n" + "=" * 70)
print("RUNNING QUALIFICATION...")
print("=" * 70)

try:
    service = LeadQualificationService(user_id)
    result = service.qualify_leads()
    
    if result.get("success"):
        print(f"\n✓ Qualification succeeded")
        print(f"  Results: {result['stats']}")
    else:
        print(f"\n❌ Qualification failed: {result.get('error')}")
        sys.exit(1)
except Exception as e:
    print(f"\n❌ Error during qualification: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Verify results were saved
print("\n" + "=" * 70)
print("CHECKING SAVED RESULTS...")
print("=" * 70)

results = get_qualification_results(user_id, str(latest_batch["_id"]))
print(f"\nTotal results saved: {len(results)}")

if results:
    for r in results[:3]:
        print(f"\n✓ Lead: {r.get('leadId')}")
        print(f"  Score: {r.get('score')}/100")
        print(f"  Status: {r.get('status')}")
        print(f"  Reason: {r.get('qualificationReason')}")
else:
    print("\n⚠️  No results found in MongoDB!")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
