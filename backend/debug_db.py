#!/usr/bin/env python3
"""Debug script to check database state."""

import os
from dotenv import load_dotenv
from config.db import init_db, get_db
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

# Initialize database
init_db()
db = get_db()

print("=" * 60)
print("DEBUGGING DATABASE STATE")
print("=" * 60)

# Check ICP profiles
print("\n[ICP PROFILES]")
icps = list(db.icp_profiles.find({}))
print(f"Total ICP Profiles: {len(icps)}")
if icps:
    for icp in icps:
        print(f"\n  User: {icp.get('userId')}")
        print(f"  Active: {icp.get('active')}")
        print(f"  Target Industries: {icp.get('targetIndustries')}")
        print(f"  Target Tech Stack: {icp.get('targetTechStack')}")
        print(f"  Target Funding: {icp.get('targetFundingStage')}")
        print(f"  Target Roles: {icp.get('targetRoles')}")
        print(f"  Target Company Size: {icp.get('targetCompanySize')}")
else:
    print("  NO ICP PROFILES FOUND - This is likely the issue!")

# Check leads
print("\n[LEADS]")
leads = list(db.leads.find({}).limit(3))
print(f"Total Leads in DB: {db.leads.count_documents({})}")
if leads:
    for lead in leads:
        print(f"\n  Name: {lead.get('name')}")
        print(f"  Email: {lead.get('email')}")
        print(f"  Industry: {lead.get('industry')}")
        print(f"  Company Tech Stack: {lead.get('companyTechStack')}")
        print(f"  Funding Stage: {lead.get('fundingStage')}")
        print(f"  Employee Count: {lead.get('employeeCount')}")
        print(f"  Batch ID: {lead.get('batchId')}")
else:
    print("  NO LEADS FOUND")

# Check qualification results
print("\n[QUALIFICATION RESULTS]")
results = list(db.qualification_results.find({}).limit(3))
print(f"Total Results in DB: {db.qualification_results.count_documents({})}")
if results:
    for r in results:
        print(f"\n  Lead ID: {r.get('leadId')}")
        print(f"  Score: {r.get('score')}")
        print(f"  Status: {r.get('status')}")
        print(f"  Color: {r.get('color')}")
        print(f"  Reasoning: {r.get('qualificationReason')}")
else:
    print("  NO QUALIFICATION RESULTS FOUND - Check this!")

print("\n" + "=" * 60)
