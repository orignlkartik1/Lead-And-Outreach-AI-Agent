#!/usr/bin/env python3
"""Test ICP validation against lead data."""

import os
import sys
from dotenv import load_dotenv
from bson.objectid import ObjectId
from config.db import init_db, get_db
from models.icpModel import get_active_icp
from models.leadModel import get_latest_batch_leads, get_latest_batch
from utils.qualificationHelper import calculate_score, get_qualification_status

# Load environment
load_dotenv()
init_db()
db = get_db()

print("\n" + "=" * 80)
print("ICP VALIDATION TEST")
print("=" * 80)

# Get user
user = db.users.find_one({})
if not user:
    print("\n❌ No user found")
    sys.exit(1)

user_id = str(user["_id"])
email = user.get("email", "Unknown")
print(f"\n✓ User: {email}")

# Get ICP
icp = get_active_icp(user_id)
if not icp:
    print("❌ No ICP profile found")
    sys.exit(1)

print(f"\n✓ ICP Profile: {icp.get('productName', 'Unnamed')}")
print(f"  Target Industries: {icp.get('targetIndustries')}")
print(f"  Target Tech Stack: {icp.get('targetTechStack')}")
print(f"  Target Roles: {icp.get('targetRoles')}")
print(f"  Target Company Size: {icp.get('targetCompanySize')}")
print(f"  Target Funding: {icp.get('targetFundingStage')}")

# Get leads
leads = get_latest_batch_leads(user_id)
if not leads:
    print("\n❌ No leads found")
    sys.exit(1)

print(f"\n✓ Found {len(leads)} lead(s)")
print("\n" + "-" * 80)
print("SCORING AGAINST YOUR ICP:")
print("-" * 80)

for lead in leads:
    print(f"\n📋 {lead.get('name')} @ {lead.get('company')}")
    print(f"   Email: {lead.get('email')}")
    print(f"   Industry: {lead.get('industry')}")
    print(f"   Role: {lead.get('role')}")
    print(f"   Employee Count: {lead.get('employeeCount')}")
    print(f"   Tech Stack: {lead.get('companyTechStack')}")
    print(f"   Funding Stage: {lead.get('fundingStage')}")
    print(f"   Recent Trigger: {lead.get('recentTriggerEvent')}")
    
    # Score
    score_result = calculate_score(lead, icp)
    status_info = get_qualification_status(score_result["score"])
    
    print(f"\n   ⭐ SCORE: {score_result['score']}/100")
    print(f"   📊 Status: {status_info['status'].upper()}")
    print(f"   📝 Reason: {status_info['description']}")
    print(f"   🎯 Color: {status_info['color']}")
    print(f"\n   Scoring Breakdown:")
    for reason in score_result['reasons']:
        print(f"      • {reason}")

print("\n" + "=" * 80)
print("✓ ICP VALIDATION COMPLETE")
print("=" * 80 + "\n")
