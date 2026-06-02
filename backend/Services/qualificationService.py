import os
import json
import re
from typing import Any
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field
from datetime import datetime
from bson.objectid import ObjectId

from models.leadModel import get_latest_batch_leads, get_latest_batch
from models.icpModel import get_active_icp
from models.qualificationResultModel import save_qualification_results
from utils.qualificationHelper import calculate_score, get_qualification_status, generate_recommendation
from config.db import get_db


class QualificationResult(BaseModel):
    """Pydantic model for qualification result."""
    lead_id: str = Field(..., description="Lead MongoDB ObjectId")
    score: int = Field(..., description="Qualification score 0-100")
    status: str = Field(..., description="Status: strong_qualified, moderate, rejected")
    color: str = Field(..., description="Color: green, yellow, red")
    qualification_reason: str = Field(..., description="Why lead qualifies or doesn't")
    strengths: list = Field(default_factory=list, description="Lead strengths")
    weaknesses: list = Field(default_factory=list, description="Lead weaknesses")
    recommended_action: str = Field(..., description="What to do with this lead")
    priority_level: str = Field(..., description="Priority: high, medium, low")
    ai_reasoning: str = Field(..., description="AI agent reasoning process")


class LeadQualificationService:
    """
    Service for orchestrating AI-powered lead qualification using CrewAI.
    
    Workflow:
    1. Fetch active ICP profile
    2. Fetch leads from latest batch ONLY
    3. Create CrewAI agents for qualification
    4. Score each lead against ICP
    5. Generate AI reasoning
    6. Store results in MongoDB
    
    CRITICAL: Only processes the most recently uploaded CSV batch.
    """
    
    def __init__(self, user_id: str, openai_api_key: str = None):
        self.user_id = user_id
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        # OpenAI API key is optional - service will use fallback scoring if not available
        
        self.db = get_db()
    
    def _create_qualification_agent(self) -> Agent:
        """Create the lead qualification AI agent."""
        return Agent(
            role="Lead Qualification Expert",
            goal="Qualify leads based on ICP fit, score them accurately, and provide AI reasoning",
            backstory="""You are an expert SDR and lead qualification specialist. 
            You have deep experience in:
            - Identifying high-fit leads based on ICP profiles
            - Scoring leads on multiple dimensions
            - Providing clear, actionable reasoning for qualification decisions
            - Understanding B2B sales dynamics and buyer personas
            
            Your decisions are data-driven, nuanced, and consider multiple factors.
            Always provide structured JSON output with clear scoring breakdown.""",
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_scoring_agent(self) -> Agent:
        """Create the scoring and analysis agent."""
        return Agent(
            role="Lead Scoring Analyst",
            goal="Provide detailed scoring analysis with weighted criteria",
            backstory="""You are a lead scoring expert with deep understanding of:
            - Qualification scoring models and frameworks
            - Weighted scoring systems with clear point allocation
            - Fit and intent signals in B2B sales
            - Lead prioritization and segmentation
            
            You excel at breaking down complex scoring into clear, understandable components.
            Always justify your scoring with specific evidence from the lead data.""",
            verbose=True,
            allow_delegation=False,
        )
    
    def _extract_icp_context(self, icp: dict) -> str:
        """Extract ICP data for agent context. Supports both custom and structured formats."""
        if not icp:
            return "No ICP profile found"

        # If custom ICP text is provided, include it with structured summary.
        custom_text = icp.get("customIcp", "").strip()
        structured_summary = f"""
ACTIVE ICP PROFILE:

Your Company:
- Industry: {icp.get('projectIndustry', 'Not specified')}
- Product: {icp.get('productName', 'Not specified')}
- Description: {icp.get('productDescription', 'Not specified')}
- Capabilities: {', '.join(icp.get('productCapabilities', [])) or 'Not specified'}
- Target Companies/Departments: {', '.join(icp.get('preferredDepartments', [])) or icp.get('idealCompanies', 'Not specified')}

Target Buyer Persona:
- Industries: {', '.join(icp.get('targetIndustries', [])) or 'Not specified'}
- Decision Makers/Roles: {', '.join(icp.get('targetRoles', [])) or 'Not specified'}
- Company Size Min/Max: {icp.get('companySizeMin', 'Any')} / {icp.get('companySizeMax', 'Any')}
- Company Size Legacy: {icp.get('targetCompanySize', 'Any')}
- Tech Stack: {', '.join(icp.get('targetTechStack', [])) or 'Not specified'}
- Funding Stage: {icp.get('targetFundingStage', 'Any')}
- Locations: {', '.join(icp.get('targetLocations', [])) or 'Not specified'}
- Currently Hiring Preference: {icp.get('targetCurrentlyHiring', 'Any')}
- Recent Triggers: {icp.get('recentTriggerEvents', 'None specified')}
"""

        if custom_text:
            return f"""
ACTIVE ICP PROFILE (Custom):

{custom_text}

{structured_summary}
"""

        return structured_summary
    
    def _create_qualification_task(self, agent: Agent, lead: dict, icp_context: str) -> Task:
        """Create a task for qualifying a single lead."""
        lead_info = f"""
Lead Information:
- Name: {lead.get('name', 'Unknown')}
- Company: {lead.get('company', 'Unknown')}
- Role: {lead.get('role', 'Unknown')}
- Industry: {lead.get('industry', 'Unknown')}
- Email: {lead.get('email', 'Unknown')}
- Company Size: {lead.get('employeeCount', 'Unknown')}
- Tech Stack: {lead.get('companyTechStack', 'Unknown')}
- Funding Stage: {lead.get('fundingStage', 'Unknown')}
- Currently Hiring: {lead.get('currentlyHiring', 'Unknown')}
- Location: {lead.get('location', 'Unknown')}
- Recent Trigger: {lead.get('recentTriggerEvent', 'None')}
"""
        
        return Task(
            description=f"""
Qualify this lead against our ICP profile and provide structured scoring:

{icp_context}

{lead_info}

SCORING CRITERIA (Total: 110 points before normalization):
1. Industry Match: 20 points max
2. Company Size Match: 20 points max
3. Tech Stack Match: 20 points max
4. Decision Maker Match: 15 points max
5. Funding Stage Match: 15 points max
6. Recent Trigger Match: 10 points max
7. Currently Hiring Match: 10 points max

PROVIDE EXACTLY THIS JSON STRUCTURE:
{{
  "score": <integer 0-100>,
  "status": "<strong_qualified|moderate|rejected>",
  "color": "<green|yellow|red>",
  "strengths": [<list of 2-3 specific strengths>],
  "weaknesses": [<list of 2-3 specific weaknesses>],
  "recommended_action": "<specific next step recommendation>",
  "priority_level": "<high|medium|low>",
  "ai_reasoning": "<detailed explanation of scoring decision>"
}}

Be specific about why each score was given. Reference actual lead data and ICP criteria.
""",
            agent=agent,
            expected_output="Valid JSON object with qualification scoring and reasoning"
        )
    
    def _parse_qualification_result(self, result: str, lead_id: str) -> dict:
        """Parse AI agent output into structured qualification result."""
        try:
            # Try to extract JSON from the result
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = result[json_start:json_end]
                parsed = json.loads(json_str)
            else:
                # Fallback parsing if JSON not found
                parsed = self._fallback_parse(result)
            
            # Validate and normalize parsed data
            score = min(100, max(0, int(parsed.get("score", 50))))
            status = parsed.get("status", "moderate").lower()
            
            # Ensure valid status
            if status not in ["strong_qualified", "moderate", "rejected"]:
                status_info = get_qualification_status(score)
                status = status_info["status"]
                color = status_info["color"]
            else:
                color = parsed.get("color", "yellow")
            
            return {
                "lead_id": lead_id,
                "score": score,
                "status": status,
                "color": color,
                "qualification_reason": parsed.get("qualification_reason", "See AI reasoning"),
                "strengths": parsed.get("strengths", []) or ["Review needed"],
                "weaknesses": parsed.get("weaknesses", []) or ["Review needed"],
                "recommended_action": parsed.get("recommended_action", "Review manually"),
                "priority_level": parsed.get("priority_level", "medium"),
                "ai_reasoning": parsed.get("ai_reasoning", result[:500]),
            }
        except Exception as e:
            print(f"Error parsing qualification result: {e}")
            return {
                "lead_id": lead_id,
                "score": 50,
                "status": "moderate",
                "color": "yellow",
                "qualification_reason": "Qualification pending manual review",
                "strengths": ["Needs review"],
                "weaknesses": ["Parse error"],
                "recommended_action": "Review manually",
                "priority_level": "medium",
                "ai_reasoning": f"Automatic parsing failed: {str(e)}",
            }
    
    def _fallback_parse(self, text: str) -> dict:
        """Fallback parsing if JSON extraction fails."""
        # Try to extract score from text
        score_match = re.search(r'\b(\d{1,3})\s*(?:/100|points?)\b', text.lower())
        score = int(score_match.group(1)) if score_match else 50
        
        return {
            "score": min(100, max(0, score)),
            "status": "moderate",
            "color": "yellow",
            "strengths": ["Needs manual review"],
            "weaknesses": ["Parse error - review needed"],
            "recommended_action": "Review manually",
            "priority_level": "medium",
            "ai_reasoning": text[:300],
        }
    
    def _qualify_lead_with_fallback(self, lead: dict, icp: dict) -> dict:
        """
        Qualify a lead with CrewAI, falling back to rule-based scoring on error.
        """
        # If no OpenAI API key, skip CrewAI and use fallback scoring immediately
        if not self.openai_api_key:
            score_result = calculate_score(lead, icp)
            status_info = get_qualification_status(score_result["score"])
            recommendation = generate_recommendation(score_result["score"], lead, icp)
            
            return {
                "lead_id": str(lead["_id"]),
                "score": score_result["score"],
                "status": status_info["status"],
                "color": status_info["color"],
                "qualification_reason": status_info["description"],
                "strengths": score_result["reasons"][:2],
                "weaknesses": [],
                "recommended_action": recommendation,
                "priority_level": status_info["priority_level"],
                "ai_reasoning": f"Rule-based scoring (OpenAI API not configured): {' '.join(score_result['reasons'])}",
                "used_ai": False,
            }
        
        try:
            # Create CrewAI agents
            qualification_agent = self._create_qualification_agent()
            scoring_agent = self._create_scoring_agent()
            
            # Extract ICP context
            icp_context = self._extract_icp_context(icp)
            
            # Create task
            task = self._create_qualification_task(qualification_agent, lead, icp_context)
            
            # Create crew and execute
            crew = Crew(
                agents=[qualification_agent, scoring_agent],
                tasks=[task],
                verbose=True,
            )
            
            output = crew.kickoff()
            result = self._parse_qualification_result(str(output), str(lead["_id"]))
            result["used_ai"] = True
            return result
            
        except Exception as e:
            print(f"CrewAI qualification failed for {lead['name']}: {e}. Using fallback scoring.")
            
            # Fall back to rule-based scoring
            score_result = calculate_score(lead, icp)
            status_info = get_qualification_status(score_result["score"])
            recommendation = generate_recommendation(score_result["score"], lead, icp)
            
            return {
                "lead_id": str(lead["_id"]),
                "score": score_result["score"],
                "status": status_info["status"],
                "color": status_info["color"],
                "qualification_reason": status_info["description"],
                "strengths": score_result["reasons"][:2],
                "weaknesses": [],
                "recommended_action": recommendation,
                "priority_level": status_info["priority_level"],
                "ai_reasoning": f"Fallback scoring: {' '.join(score_result['reasons'])}",
                "used_ai": False,
            }
    
    def qualify_leads(self, batch_id: str = None) -> dict:
        """
        Run the complete lead qualification pipeline.
        
        CRITICAL: Only processes the most recently uploaded CSV batch.
        
        Args:
            batch_id: Optional specific batch (will use latest regardless)
        
        Returns:
            dict with qualification results and summary stats
        """
        # Fetch active ICP
        icp = get_active_icp(self.user_id)
        if not icp:
            return {
                "success": False,
                "error": "No active ICP profile found",
                "results": [],
                "stats": {"total": 0, "strong_qualified": 0, "moderate": 0, "rejected": 0}
            }
        
        # Fetch leads from latest batch ONLY
        leads = get_latest_batch_leads(self.user_id)
        if not leads:
            return {
                "success": False,
                "error": "No leads found in latest batch",
                "results": [],
                "stats": {"total": 0, "strong_qualified": 0, "moderate": 0, "rejected": 0}
            }
        
        latest_batch = get_latest_batch(self.user_id)
        print(f"Qualifying {len(leads)} leads from batch: {latest_batch['fileName']}")
        
        # Qualify each lead
        results = []
        for idx, lead in enumerate(leads, 1):
            try:
                print(f"Qualifying lead {idx}/{len(leads)}: {lead.get('name', 'Unknown')}")
                
                result = self._qualify_lead_with_fallback(lead, icp)
                results.append(result)
                
                status_emoji = "✓" if result["status"] == "strong_qualified" else "○" if result["status"] == "moderate" else "✗"
                print(f"{status_emoji} {lead['name']} - Score: {result['score']}/100 - {result['status']}")
                
            except Exception as e:
                print(f"✗ Error qualifying {lead.get('name', 'Unknown')}: {e}")
                results.append({
                    "lead_id": str(lead["_id"]),
                    "score": 50,
                    "status": "moderate",
                    "color": "yellow",
                    "qualification_reason": f"Error during qualification",
                    "strengths": [],
                    "weaknesses": ["Qualification error"],
                    "recommended_action": "Review manually",
                    "priority_level": "medium",
                    "ai_reasoning": f"Error: {str(e)}",
                    "used_ai": False,
                })
        
        # Calculate statistics
        strong_qualified = sum(1 for r in results if r["status"] == "strong_qualified")
        moderate = sum(1 for r in results if r["status"] == "moderate")
        rejected = sum(1 for r in results if r["status"] == "rejected")
        avg_score = sum(r["score"] for r in results) / len(results) if results else 0
        
        stats = {
            "total": len(results),
            "strong_qualified": strong_qualified,
            "moderate": moderate,
            "rejected": rejected,
            "average_score": round(avg_score, 2),
            "qualified_percentage": round((strong_qualified + moderate) / len(results) * 100, 2) if results else 0,
        }
        
        # Save results to MongoDB
        try:
            saved = save_qualification_results(
                self.user_id,
                str(latest_batch["_id"]),
                results
            )
            print(f"✓ Saved {len(saved)} qualification results to MongoDB")
        except Exception as e:
            print(f"✗ Error saving results to MongoDB: {e}")
        
        return {
            "success": True,
            "batch_id": str(latest_batch["_id"]),
            "batch_name": latest_batch.get("fileName"),
            "results": results,
            "stats": stats,
        }
