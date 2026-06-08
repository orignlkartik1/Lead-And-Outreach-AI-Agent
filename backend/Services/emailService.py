import os
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field
from config.db import get_db


class EmailTemplate(BaseModel):
    """Email template model."""
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body with placeholders like {lead_name}")
    template_type: str = Field(..., description="Type: welcome, follow_up, closing")


class EmailCampaign(BaseModel):
    """Email campaign model."""
    campaign_id: str = Field(..., description="Unique campaign identifier")
    name: str = Field(..., description="Campaign name")
    status: str = Field(..., description="Status: draft, scheduled, in_progress, completed, paused")
    template_id: str = Field(..., description="Email template ID")
    target_leads: List[str] = Field(default_factory=list, description="Lead IDs to target")
    personalization_data: Dict = Field(default_factory=dict, description="Custom data for personalization")
    scheduled_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class EmailService:
    """
    Service for managing email outreach campaigns and follow-up sequences.
    Uses CrewAI agents to compose personalized emails and manage campaigns.
    """
    
    def __init__(self, user_id: str, openai_api_key: str = None):
        self.user_id = user_id
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.db = get_db()
        
        # SMTP configuration
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL")
        self.from_name = os.getenv("FROM_NAME", "Sales Team")
    
    def _create_email_composer_agent(self) -> Agent:
        """Create the email composition AI agent."""
        return Agent(
            role="Email Copywriter",
            goal="Compose personalized, compelling email outreach messages for B2B leads",
            backstory="""You are an expert B2B email copywriter with deep experience in:
            - Crafting personalized, high-converting sales emails
            - Understanding pain points and value propositions
            - Creating subject lines that get opens
            - Tailoring messaging for different buyer personas
            
            Your emails are concise, benefit-focused, and include a clear call-to-action.
            You personalize based on lead data like company, role, and industry.""",
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_outreach_strategist_agent(self) -> Agent:
        """Create the outreach strategy AI agent."""
        return Agent(
            role="Outreach Strategist",
            goal="Determine optimal email sequences and timing for maximum engagement",
            backstory="""You are an experienced outreach strategist who specializes in:
            - Designing effective follow-up sequences
            - Understanding decision-making timelines in B2B
            - Determining optimal email frequency and timing
            - Crafting different messaging for different sequence stages
            
            You balance persistence with respect for recipient preferences.""",
            verbose=True,
            allow_delegation=False,
        )
    
    def _create_email_composition_task(
        self, 
        agent: Agent, 
        lead: dict, 
        email_context: str, 
        sequence_step: int = 1
    ) -> Task:
        """Create a task for composing a personalized email."""
        lead_info = f"""
Lead Information:
- Name: {lead.get('name', 'Unknown')}
- Company: {lead.get('company', 'Unknown')}
- Role: {lead.get('role', 'Unknown')}
- Industry: {lead.get('industry', 'Unknown')}
- Company Size: {lead.get('employeeCount', 'Unknown')}
- Location: {lead.get('location', 'Unknown')}
"""
        
        sequence_guidance = f"""
This is step {sequence_step} in the outreach sequence:
- Step 1: Initial personalized introduction (mention company insight or trigger)
- Step 2: Highlight specific value proposition and past client success
- Step 3: Social proof and limited-time opportunity mention
- Step 4: Final closing appeal with alternative contact options
"""
        
        return Task(
            description=f"""
Compose a compelling personalized email for this B2B lead:

{email_context}

{lead_info}

{sequence_guidance}

REQUIREMENTS:
- Subject line should be personalized and compelling (under 50 characters)
- Email body should be 100-200 words
- Include a specific, clear call-to-action
- Be conversational and genuine, not salesy
- Reference specific company/role insights if available
- End with a professional closing

PROVIDE THIS JSON STRUCTURE:
{{
  "subject_line": "<compelling subject line>",
  "email_body": "<personalized email body>",
  "call_to_action": "<specific next step>",
  "reasoning": "<why this approach will resonate with this lead>"
}}
""",
            agent=agent,
            expected_output="Valid JSON object with email content and reasoning"
        )
    
    def compose_email(
        self, 
        lead: dict, 
        company_info: dict, 
        sequence_step: int = 1
    ) -> dict:
        """
        Use CrewAI agents to compose a personalized email for a lead.
        Falls back to template if AI fails.
        
        Args:
            lead: Lead document from MongoDB
            company_info: Company context and product info
            sequence_step: Which step in the sequence (1-4)
        
        Returns:
            dict with subject_line, email_body, and call_to_action
        """
        if not self.openai_api_key:
            return self._compose_email_template(lead, company_info, sequence_step)
        
        try:
            composer_agent = self._create_email_composer_agent()
            strategist_agent = self._create_outreach_strategist_agent()
            
            email_context = f"""
Your Company/Product:
- Name: {company_info.get('name', 'Our Company')}
- Industry: {company_info.get('industry', '')}
- Description: {company_info.get('description', '')}
- Key Value Proposition: {company_info.get('value_prop', '')}
"""
            
            task = self._create_email_composition_task(
                composer_agent, 
                lead, 
                email_context, 
                sequence_step
            )
            
            crew = Crew(
                agents=[composer_agent, strategist_agent],
                tasks=[task],
                verbose=True,
            )
            
            output = crew.kickoff()
            result = self._parse_email_composition(str(output))
            return result
            
        except Exception as e:
            print(f"Email composition AI failed: {e}. Using template fallback.")
            return self._compose_email_template(lead, company_info, sequence_step)
    
    def _parse_email_composition(self, result: str) -> dict:
        """Parse AI agent output into email structure."""
        try:
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = result[json_start:json_end]
                parsed = json.loads(json_str)
                return {
                    "subject_line": parsed.get("subject_line", "Let's Connect"),
                    "email_body": parsed.get("email_body", ""),
                    "call_to_action": parsed.get("call_to_action", "Let me know your thoughts"),
                    "used_ai": True,
                }
        except Exception as e:
            print(f"Error parsing email composition: {e}")
        
        return {
            "subject_line": "Let's Connect",
            "email_body": "I'd love to explore how we can help your team.",
            "call_to_action": "Let me know if you're interested in learning more",
            "used_ai": False,
        }
    
    def _compose_email_template(
        self, 
        lead: dict, 
        company_info: dict, 
        sequence_step: int
    ) -> dict:
        """Fallback template-based email composition."""
        # Get value proposition
        value_prop = company_info.get('value_prop', 'We help companies streamline operations.') if company_info else 'We help companies streamline operations.'
        
        templates = {
            1: {
                "subject": "Quick insight for {company}",
                "body": "Hi {name},\n\nI came across {company} and thought of you given your role in {role}.\n\n{value_prop}.\n\nWould be great to grab 15 minutes to explore if this could be relevant.\n\nBest,\n{from_name}",
                "cta": "Let me know if you're open to a quick conversation"
            },
            2: {
                "subject": "Follow-up: {company} + {value}",
                "body": "Hi {name},\n\nFollowing up on my previous note. I wanted to share a quick case study from a similar company in {industry} that saw significant results with our solution.\n\nWould you be open to a brief conversation?\n\nBest,\n{from_name}",
                "cta": "Are you available for a 15-minute call this week?"
            },
            3: {
                "subject": "Last chance: {company} opportunity",
                "body": "Hi {name},\n\nThis is my last attempt to reach out. I genuinely believe we could help {company} with {role}-related challenges.\n\nIf now's not the right time, I understand—but feel free to reach out if circumstances change.\n\nBest,\n{from_name}",
                "cta": "Let's schedule a time that works for you"
            }
        }
        
        template = templates.get(min(sequence_step, 3), templates[1])
        
        return {
            "subject_line": template["subject"].format(
                company=lead.get('company', 'your company'),
                name=lead.get('name', 'there'),
                role=lead.get('role', 'your role'),
                value=value_prop
            ),
            "email_body": template["body"].format(
                name=lead.get('name', 'there'),
                company=lead.get('company', 'your company'),
                role=lead.get('role', 'your role'),
                industry=lead.get('industry', 'your industry'),
                from_name=self.from_name or 'Sales Team',
                value_prop=value_prop
            ),
            "call_to_action": template["cta"],
            "used_ai": False,
        }
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        body: str,
        lead_id: str = None,
        campaign_id: str = None
    ) -> dict:
        """
        Send an email via SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body (HTML or plain text)
            lead_id: Optional lead ID for tracking
            campaign_id: Optional campaign ID for tracking
        
        Returns:
            dict with success status and message ID
        """
        if not all([self.smtp_user, self.smtp_password, self.from_email]):
            return {
                "success": False,
                "error": "SMTP credentials not configured. Set SMTP_USER, SMTP_PASSWORD, and FROM_EMAIL",
                "message_id": None
            }
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            
            # Attach body as HTML if it contains HTML, otherwise plain text
            if '<' in body and '>' in body:
                msg.attach(MIMEText(body, "html"))
            else:
                msg.attach(MIMEText(body, "plain"))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                response = server.sendmail(self.from_email, [to_email], msg.as_string())
            
            # Log email history
            email_record = {
                "userId": self.user_id,
                "leadId": lead_id,
                "campaignId": campaign_id,
                "toEmail": to_email,
                "subject": subject,
                "body": body[:500],  # Store first 500 chars
                "status": "sent",
                "sentAt": datetime.utcnow(),
                "messageId": msg["Message-ID"],
            }
            
            self.db.emailHistory.insert_one(email_record)
            
            return {
                "success": True,
                "message": f"Email sent successfully to {to_email}",
                "message_id": msg["Message-ID"]
            }
        
        except smtplib.SMTPAuthenticationError:
            return {
                "success": False,
                "error": "SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD",
                "message_id": None
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to send email: {str(e)}",
                "message_id": None
            }
    
    def create_campaign(
        self,
        name: str,
        template_type: str,
        target_lead_ids: List[str],
        company_info: dict,
        scheduled_at: str = None
    ) -> dict:
        """
        Create an email campaign with follow-up sequences.
        
        Args:
            name: Campaign name
            template_type: "welcome", "follow_up", or "custom"
            target_lead_ids: List of lead IDs to target
            company_info: Company/product information
            scheduled_at: ISO datetime string for scheduling
        
        Returns:
            Campaign document with ID
        """
        from bson.objectid import ObjectId
        
        campaign = {
            "userId": self.user_id,
            "name": name,
            "templateType": template_type,
            "targetLeads": target_lead_ids,
            "companyInfo": company_info,
            "status": "scheduled" if scheduled_at else "draft",
            "scheduledAt": scheduled_at,
            "createdAt": datetime.utcnow(),
            "stats": {
                "total": len(target_lead_ids),
                "sent": 0,
                "opened": 0,
                "clicked": 0,
                "bounced": 0,
            }
        }
        
        result = self.db.emailCampaigns.insert_one(campaign)
        campaign["_id"] = result.inserted_id
        
        return campaign
    
    def launch_campaign(self, campaign_id: str) -> dict:
        """
        Launch a campaign and start sending emails.
        
        Args:
            campaign_id: Campaign ID
        
        Returns:
            Campaign status and results
        """
        from bson.objectid import ObjectId
        
        campaign = self.db.emailCampaigns.find_one({
            "_id": ObjectId(campaign_id),
            "userId": self.user_id
        })
        
        if not campaign:
            return {"success": False, "error": "Campaign not found"}
        
        results = []
        for idx, lead_id in enumerate(campaign.get("targetLeads", [])):
            try:
                lead = self.db.leads.find_one({
                    "_id": ObjectId(lead_id),
                    "userId": self.user_id
                })
                
                if not lead or not lead.get("email"):
                    continue
                
                # Compose personalized email
                email = self.compose_email(
                    lead,
                    campaign.get("companyInfo", {}),
                    sequence_step=1
                )
                
                # Send email
                send_result = self.send_email(
                    to_email=lead["email"],
                    subject=email["subject_line"],
                    body=email["email_body"],
                    lead_id=str(lead["_id"]),
                    campaign_id=campaign_id
                )
                
                results.append({
                    "lead_id": str(lead["_id"]),
                    "email": lead["email"],
                    "sent": send_result["success"],
                    "message": send_result.get("message", send_result.get("error"))
                })
                
            except Exception as e:
                results.append({
                    "lead_id": lead_id,
                    "sent": False,
                    "message": f"Error: {str(e)}"
                })
        
        # Update campaign status
        self.db.emailCampaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {
                "$set": {
                    "status": "in_progress",
                    "launchedAt": datetime.utcnow(),
                    "stats.sent": sum(1 for r in results if r["sent"])
                }
            }
        )
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "results": results,
            "total_sent": sum(1 for r in results if r["sent"])
        }
    
    def get_campaign_history(self, campaign_id: str = None) -> List[dict]:
        """Retrieve email campaign history."""
        from bson.objectid import ObjectId
        
        query = {"userId": self.user_id}
        if campaign_id:
            query["_id"] = ObjectId(campaign_id)
        
        campaigns = list(self.db.emailCampaigns.find(query).sort("createdAt", -1))
        
        # Convert ObjectId to string
        for campaign in campaigns:
            campaign["_id"] = str(campaign["_id"])
        
        return campaigns
