"""Utility functions for lead qualification and scoring."""

from datetime import datetime


def calculate_score(lead: dict, icp: dict) -> dict:
    """
    Calculate qualification score using weighted criteria.
    
    Scoring weights:
    - Industry Match: 20 points
    - Company Size Match: 20 points  
    - Tech Stack Match: 20 points
    - Decision Maker Match: 15 points
    - Funding Stage Match: 15 points
    - Recent Trigger Match: 10 points
    - Currently Hiring Match: 10 points
    Total: 110 points before normalization
    """
    score = 0
    reasons = []
    
    # Industry Match (20 points)
    lead_industry = (lead.get("industry") or "").lower()
    target_industries = [i.lower() for i in icp.get("targetIndustries", [])]
    
    if target_industries and any(ind in lead_industry for ind in target_industries):
        score += 20
        reasons.append("✓ Industry matches ICP target")
    elif target_industries:
        score += 5
        reasons.append("✗ Industry does not match ICP")
    else:
        score += 10
        reasons.append("○ Industry not evaluated (no ICP criteria)")
    
    # Company Size Match (20 points)
    lead_size_str = str(lead.get("employeeCount") or "").strip()
    target_size = str(icp.get("targetCompanySize") or "").strip()
    min_size = icp.get("companySizeMin")
    max_size = icp.get("companySizeMax")
    
    def parse_int(value):
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    lead_count = parse_int(lead_size_str)
    min_size = parse_int(min_size)
    max_size = parse_int(max_size)
    company_size_match = False

    if lead_count is not None:
        if min_size is not None or max_size is not None:
            if min_size is not None and max_size is not None:
                company_size_match = min_size <= lead_count <= max_size
            elif min_size is not None:
                company_size_match = lead_count >= min_size
            elif max_size is not None:
                company_size_match = lead_count <= max_size
        elif target_size:
            try:
                if "-" in target_size:
                    parts = target_size.split("-")
                    min_target = parse_int(parts[0].strip())
                    max_target = parse_int(parts[1].strip())
                    if min_target is not None and max_target is not None:
                        company_size_match = min_target <= lead_count <= max_target
                else:
                    company_size_match = lead_size_str == target_size
            except (ValueError, IndexError):
                company_size_match = lead_size_str == target_size

    if company_size_match:
        score += 20
        reasons.append("✓ Company size matches ICP")
    elif target_size or min_size is not None or max_size is not None:
        score += 10
        reasons.append("○ Company size not evaluated")
    
    # Tech Stack Match (20 points)
    lead_stack = (lead.get("companyTechStack") or "").lower()
    target_stack = [t.lower() for t in icp.get("targetTechStack", [])]
    
    if target_stack and any(tech in lead_stack for tech in target_stack):
        score += 20
        reasons.append("✓ Tech stack matches ICP")
    elif target_stack:
        score += 5
        reasons.append("✗ Tech stack does not match ICP")
    else:
        score += 10
        reasons.append("○ Tech stack not evaluated")
    
    # Decision Maker Match (15 points)
    lead_role = (lead.get("role") or "").lower()
    target_roles = [r.lower() for r in icp.get("targetRoles", [])]
    decision_keywords = ["founder", "ceo", "cto", "cfo", "vp", "head", "director", "manager"]
    
    if target_roles and any(role in lead_role for role in target_roles):
        score += 15
        reasons.append("✓ Role matches ICP decision-maker profile")
    elif any(keyword in lead_role for keyword in decision_keywords):
        score += 12
        reasons.append("✓ Role appears to be decision-maker")
    elif target_roles:
        score += 3
        reasons.append("✗ Role does not match ICP")
    else:
        score += 7
        reasons.append("○ Role not evaluated")
    
    # Funding Stage Match (15 points)
    lead_funding = (lead.get("fundingStage") or "").lower()
    target_funding = (icp.get("targetFundingStage") or "").lower()
    
    if target_funding and target_funding in lead_funding:
        score += 15
        reasons.append("✓ Funding stage matches ICP")
    elif target_funding:
        score += 5
        reasons.append("✗ Funding stage does not match ICP")
    else:
        score += 8
        reasons.append("○ Funding stage not evaluated")
    
    # Recent Trigger Match (10 points)
    lead_trigger = lead.get("recentTriggerEvent") or ""
    icp_triggers = (icp.get("recentTriggerEvents") or "").lower()
    
    trigger_keywords = ["raised", "funded", "launched", "expanded", "hired", "promoted", "acquired", "merger"]
    has_trigger = any(keyword in lead_trigger.lower() for keyword in trigger_keywords)
    has_icp_triggers = len(icp_triggers.strip()) > 10
    
    if has_icp_triggers and has_trigger:
        score += 10
        reasons.append("✓ Recent trigger event detected")
    elif has_trigger:
        score += 6
        reasons.append("✓ Recent activity signal detected")
    elif has_icp_triggers:
        score += 2
        reasons.append("✗ No recent trigger detected")
    else:
        score += 5
        reasons.append("○ Trigger events not evaluated")

    # Currently Hiring Match (10 points)
    lead_hiring = (lead.get("currentlyHiring") or "").strip().lower()
    icp_hiring = (icp.get("targetCurrentlyHiring") or "").strip().lower()
    
    if icp_hiring == "yes":
        if lead_hiring == "yes":
            score += 10
            reasons.append("✓ Company is currently hiring, matching ICP preference")
        elif lead_hiring == "no":
            score += 2
            reasons.append("✗ Company is not currently hiring")
        else:
            score += 5
            reasons.append("○ Hiring status not available")
    else:
        score += 5
        reasons.append("○ Hiring preference not required by ICP")
    
    # Normalize score to 0-100
    score = min(100, max(0, score))
    
    return {
        "score": score,
        "reasons": reasons,
        "timestamp": datetime.utcnow().isoformat(),
    }


def get_qualification_status(score: int) -> dict:
    """Convert score to status, color, and priority level."""
    if score >= 80:
        return {
            "status": "strong_qualified",
            "color": "green",
            "priority_level": "high",
            "description": "High-fit lead ready for immediate outreach"
        }
    elif score >= 70:
        return {
            "status": "moderate",
            "color": "yellow",
            "priority_level": "medium",
            "description": "Moderate fit - add to nurture sequence"
        }
    else:
        return {
            "status": "rejected",
            "color": "red",
            "priority_level": "low",
            "description": "Low fit - may review later or skip"
        }


def generate_recommendation(score: int, lead: dict, icp: dict) -> str:
    """Generate specific recommendation based on score and fit."""
    status_info = get_qualification_status(score)
    
    if status_info["status"] == "strong_qualified":
        return f"Contact immediately - this lead has {score}/100 fit with your ICP. Prioritize for SDR outreach."
    elif status_info["status"] == "moderate":
        return f"Add to nurture campaign - {score}/100 fit suggests potential with right messaging. Review and follow-up in 30 days."
    else:
        return f"Skip or research - {score}/100 fit is below threshold. Can revisit if company makes strategic moves."
