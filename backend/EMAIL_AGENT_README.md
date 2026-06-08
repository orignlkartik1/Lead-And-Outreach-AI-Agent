# Email Agent Documentation

## Overview

The Email Agent is an AI-powered outreach system that helps you send personalized emails to qualified leads and manage automated follow-up sequences. It uses CrewAI agents to compose contextually relevant emails and integrates with Gmail/SMTP for delivery.

## Features

- **AI-Powered Email Composition**: CrewAI agents automatically create personalized emails based on lead data
- **Email Campaign Management**: Create, schedule, and launch targeted campaigns
- **Follow-up Sequences**: Automated multi-step follow-up sequences with customizable delays
- **Email Templates**: Pre-defined templates for different outreach scenarios
- **Campaign Analytics**: Track email delivery, opens, and engagement metrics
- **SMTP Integration**: Full Gmail/SMTP support with TLS encryption

## Setup

### 1. Configure SMTP (Gmail)

**Option A: Using Gmail App Password (Recommended)**

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google Account Security](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character app password
5. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Your Company Name
```

**Option B: Using Alternative SMTP Provider**

```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=your-email@example.com
FROM_NAME=Your Company Name
```

### 2. Set OpenAI API Key

For AI-powered email composition:

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

### 3. Test SMTP Connection

```bash
curl http://localhost:5000/email/test-smtp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "SMTP connection successful"
}
```

## API Endpoints

### Send Single Email

```bash
POST /email/send
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "to_email": "lead@company.com",
  "subject": "Quick question about your company",
  "body": "Hi John, I noticed...",
  "lead_id": "507f1f77bcf86cd799439011",
  "campaign_id": "607f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully to lead@company.com",
  "message_id": "<message-id@gmail.com>"
}
```

### Compose Email with AI

Generate a personalized email for a specific lead using CrewAI agents.

```bash
POST /email/compose
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "lead_id": "507f1f77bcf86cd799439011",
  "company_info": {
    "name": "Acme Corp",
    "industry": "SaaS",
    "value_prop": "We help B2B SaaS companies automate lead qualification",
    "description": "AI-powered lead scoring and outreach platform"
  },
  "sequence_step": 1
}
```

**Response:**
```json
{
  "success": true,
  "composition": {
    "subject_line": "Helping companies like Acme close more deals",
    "email_body": "Hi John,\n\nI came across Acme and was impressed by...",
    "call_to_action": "Would you be open to a brief 15-minute conversation?",
    "used_ai": true
  }
}
```

### Create Campaign

Create a campaign targeting multiple leads.

```bash
POST /email/campaigns
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Q2 Outreach - Tech Companies",
  "template_type": "custom",
  "target_lead_ids": [
    "507f1f77bcf86cd799439011",
    "607f1f77bcf86cd799439012",
    "707f1f77bcf86cd799439013"
  ],
  "company_info": {
    "name": "Acme Corp",
    "value_prop": "We help B2B companies qualify leads faster",
    "description": "AI Lead Qualification Platform"
  },
  "scheduled_at": "2024-06-15T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "campaign_id": "607f1f77bcf86cd799439012",
    "name": "Q2 Outreach - Tech Companies",
    "status": "scheduled",
    "target_count": 3,
    "created_at": "2024-06-09T01:02:57.585Z"
  }
}
```

### Launch Campaign

Start sending emails from a campaign.

```bash
POST /email/campaigns/{campaign_id}/launch
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "campaign_id": "607f1f77bcf86cd799439012",
  "results": [
    {
      "lead_id": "507f1f77bcf86cd799439011",
      "email": "john@acme.com",
      "sent": true,
      "message": "Email sent successfully to john@acme.com"
    },
    {
      "lead_id": "607f1f77bcf86cd799439012",
      "email": "jane@acme.com",
      "sent": true,
      "message": "Email sent successfully to jane@acme.com"
    }
  ],
  "total_sent": 2
}
```

### List Campaigns

Get all campaigns for the current user.

```bash
GET /email/campaigns
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "_id": "607f1f77bcf86cd799439012",
      "name": "Q2 Outreach - Tech Companies",
      "status": "in_progress",
      "targetLeads": ["507f1f77bcf86cd799439011", "607f1f77bcf86cd799439012"],
      "stats": {
        "total": 2,
        "sent": 2,
        "opened": 0,
        "clicked": 0,
        "bounced": 0
      }
    }
  ]
}
```

### Get Campaign Details

```bash
GET /email/campaigns/{campaign_id}
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "_id": "607f1f77bcf86cd799439012",
    "name": "Q2 Outreach - Tech Companies",
    "status": "in_progress",
    "targetLeads": ["507f1f77bcf86cd799439011"],
    "createdAt": "2024-06-09T01:02:57.585Z"
  },
  "stats": {
    "total_sent": 2,
    "bounced": 0,
    "opened": 0,
    "clicked": 0,
    "open_rate": 0,
    "click_rate": 0
  }
}
```

### Get Email History

```bash
GET /email/history?lead_id=507f1f77bcf86cd799439011&campaign_id=607f1f77bcf86cd799439012
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "_id": "707f1f77bcf86cd799439013",
      "toEmail": "john@acme.com",
      "subject": "Quick question about Acme",
      "status": "sent",
      "sentAt": "2024-06-09T01:02:57.585Z",
      "campaignId": "607f1f77bcf86cd799439012"
    }
  ],
  "count": 1
}
```

### Save Email Template

Create reusable email templates.

```bash
POST /email/templates
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "template_type": "welcome",
  "subject": "Welcome to {company_name}",
  "body": "Hi {lead_name},\n\nWelcome to our platform!",
  "description": "Initial welcome email for new prospects"
}
```

**Response:**
```json
{
  "success": true,
  "template": {
    "template_id": "807f1f77bcf86cd799439014",
    "template_type": "welcome",
    "created_at": "2024-06-09T01:02:57.585Z"
  }
}
```

### Get Email Templates

```bash
GET /email/templates?template_type=welcome
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "_id": "807f1f77bcf86cd799439014",
      "template_type": "welcome",
      "subject": "Welcome to {company_name}",
      "body": "Hi {lead_name},\n\nWelcome to our platform!",
      "description": "Initial welcome email for new prospects",
      "createdAt": "2024-06-09T01:02:57.585Z"
    }
  ],
  "count": 1
}
```

## Email Agent Behavior

### Email Composer Agent

The Email Composer Agent uses:
- Lead information (name, company, role, industry)
- Company context (value proposition, industry)
- Sequence step information (1-4)

To create personalized emails that:
- Reference specific company details
- Match the recipient's role
- Include relevant value propositions
- Have clear calls-to-action

### Sequence Steps

1. **Step 1 - Initial Outreach**: Personalized introduction with company insight
2. **Step 2 - Value Highlight**: Feature specific value and social proof
3. **Step 3 - Urgency**: Create urgency with limited-time opportunity
4. **Step 4 - Final Close**: Last appeal with alternative contact methods

## Fallback Behavior

If OpenAI API is not configured, the system uses:
- Pre-defined templates for each sequence step
- Lead data substitution for personalization
- Dynamic call-to-action based on sequence step

## Best Practices

1. **Always test SMTP first** before launching campaigns
2. **Personalize company_info** with your actual value proposition
3. **Start with small campaigns** to test email deliverability
4. **Use the compose endpoint** to review emails before sending
5. **Track campaign metrics** to optimize follow-up timing
6. **Respect email frequency** - avoid more than 3-4 touches per lead
7. **Monitor bounce rates** to keep your sender reputation clean

## Troubleshooting

### SMTP Authentication Failed

```
Error: SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD
```

**Solution:**
- If using Gmail, ensure you're using an App Password, not your regular password
- Verify 2-Factor Authentication is enabled
- Check that credentials are correctly copied (no extra spaces)

### Email Sending Failed

```
Error: Failed to send email: Connection timed out
```

**Solution:**
- Check SMTP_HOST and SMTP_PORT are correct
- Verify firewall isn't blocking SMTP port (usually 587 or 465)
- Test with `/email/test-smtp` endpoint first

### AI Email Composition Not Working

If emails use template fallbacks instead of AI composition:
- Verify OPENAI_API_KEY is set
- Check OpenAI API quota and billing
- Review CrewAI agent logs for specific errors

## Database Collections

- **emailCampaigns**: Campaign definitions and status
- **emailHistory**: Sent email records and delivery status
- **emailTemplates**: Reusable email templates
- **followUpSequences**: Automated follow-up scheduling

## Development

To add new email template types, modify `emailService.py`:

```python
def _compose_email_template(self, lead, company_info, sequence_step):
    templates = {
        1: { ... },
        2: { ... },
        # Add new templates here
    }
```

## Integration with Lead Qualification

After qualifying leads, automatically send outreach:

```python
# After lead qualification
qualified_leads = [l for l in leads if l["status"] == "strong_qualified"]

email_service = EmailService(user_id)
campaign = email_service.create_campaign(
    name="Qualified Leads Outreach",
    template_type="custom",
    target_lead_ids=[str(l["_id"]) for l in qualified_leads],
    company_info=company_data
)
email_service.launch_campaign(str(campaign["_id"]))
```
