# Email Agent Quick Start Guide

## 5-Minute Setup

### Step 1: Configure Gmail SMTP (2 minutes)

1. **Enable 2-Factor Authentication:**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click "Security" in the left menu
   - Enable 2-Step Verification

2. **Get App Password:**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device type)
   - Click "Generate"
   - Copy the 16-character app password

3. **Update .env file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Your Name or Company
```

### Step 2: Test SMTP Connection (1 minute)

```bash
# Get JWT token from login first
export TOKEN="your-jwt-token-here"

# Test SMTP connection
curl http://localhost:5000/email/test-smtp \
  -H "Authorization: Bearer $TOKEN"

# Response should be:
# {"success": true, "message": "SMTP connection successful"}
```

### Step 3: Send Your First Email (2 minutes)

```bash
# Get a lead ID from your database
# Then compose and send an email

curl http://localhost:5000/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "john@example.com",
    "subject": "Quick question about your company",
    "body": "Hi John,\n\nI noticed you work at Example Corp...",
    "lead_id": "507f1f77bcf86cd799439011"
  }'
```

## Common Use Cases

### Use Case 1: Send Email to a Single Lead

After qualifying leads, send a personalized email:

```bash
curl http://localhost:5000/email/compose \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "507f1f77bcf86cd799439011",
    "company_info": {
      "name": "Acme Corp",
      "value_prop": "We help companies automate lead qualification and save 10+ hours per week"
    },
    "sequence_step": 1
  }'
```

Response:
```json
{
  "success": true,
  "composition": {
    "subject_line": "Quick insight for Company Name",
    "email_body": "Hi John,\n\nI came across...",
    "call_to_action": "Let me know if you're open...",
    "used_ai": true
  }
}
```

Then send it:
```bash
curl http://localhost:5000/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "john@company.com",
    "subject": "Quick insight for Company Name",
    "body": "Hi John,\n\nI came across...",
    "lead_id": "507f1f77bcf86cd799439011"
  }'
```

### Use Case 2: Create a Campaign for Qualified Leads

Create a campaign targeting all "strong_qualified" leads:

```bash
curl http://localhost:5000/email/campaigns \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q2 Outreach - Strong Qualified Leads",
    "template_type": "custom",
    "target_lead_ids": [
      "507f1f77bcf86cd799439011",
      "607f1f77bcf86cd799439012",
      "707f1f77bcf86cd799439013"
    ],
    "company_info": {
      "name": "Acme Solutions",
      "value_prop": "AI-powered lead qualification that saves 10+ hours per week",
      "description": "Lead scoring and outreach automation platform"
    }
  }'
```

Response:
```json
{
  "success": true,
  "campaign": {
    "campaign_id": "807f1f77bcf86cd799439014",
    "name": "Q2 Outreach - Strong Qualified Leads",
    "status": "draft",
    "target_count": 3,
    "created_at": "2024-06-09T01:02:57.585Z"
  }
}
```

### Use Case 3: Launch Campaign

Send emails to all leads in the campaign:

```bash
curl http://localhost:5000/email/campaigns/807f1f77bcf86cd799439014/launch \
  -X POST \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "campaign_id": "807f1f77bcf86cd799439014",
  "total_sent": 3,
  "results": [
    {
      "lead_id": "507f1f77bcf86cd799439011",
      "email": "john@acme.com",
      "sent": true,
      "message": "Email sent successfully"
    },
    ...
  ]
}
```

### Use Case 4: Track Campaign Performance

```bash
# Get all campaigns
curl http://localhost:5000/email/campaigns \
  -H "Authorization: Bearer $TOKEN"

# Get specific campaign with stats
curl http://localhost:5000/email/campaigns/807f1f77bcf86cd799439014 \
  -H "Authorization: Bearer $TOKEN"
```

### Use Case 5: View Email History

```bash
# Get all emails sent
curl http://localhost:5000/email/history \
  -H "Authorization: Bearer $TOKEN"

# Get emails for a specific campaign
curl http://localhost:5000/email/history?campaign_id=807f1f77bcf86cd799439014 \
  -H "Authorization: Bearer $TOKEN"

# Get emails for a specific lead
curl http://localhost:5000/email/history?lead_id=507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```

## Workflow: From Qualification to Outreach

```
1. Upload leads (CSV)
   └─> POST /lead/upload

2. Qualify leads using AI
   └─> POST /qualification/qualify

3. Filter strong qualified leads
   └─> GET /lead/search?qualification_status=strong_qualified

4. Create email campaign
   └─> POST /email/campaigns
       (with list of lead IDs)

5. Launch campaign
   └─> POST /email/campaigns/{id}/launch

6. Monitor campaign performance
   └─> GET /email/campaigns/{id}
       └─> Check stats (sent, opened, clicked)

7. Send follow-up emails (optional)
   └─> Compose next step emails
   └─> Launch follow-up campaign
```

## Troubleshooting

### SMTP Authentication Error
```
Error: "SMTP authentication failed"
```
**Solution:**
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Factor Authentication is enabled on your Google Account
- Try copying the app password again (sometimes it includes spaces)

### Email Not Sending
```
Error: "Connection timed out"
```
**Solution:**
- Check that SMTP_HOST and SMTP_PORT are correct
- Verify firewall isn't blocking port 587
- Test with `/email/test-smtp` endpoint first

### No Subject or Body in Email
- Make sure to call `/email/compose` first to generate content
- Or provide subject and body in the `/email/send` request

## Pro Tips

1. **Always test SMTP first** before launching campaigns
```bash
curl http://localhost:5000/email/test-smtp \
  -H "Authorization: Bearer $TOKEN"
```

2. **Preview emails before sending** using the compose endpoint
```bash
curl http://localhost:5000/email/compose \
  -H "Authorization: Bearer $TOKEN" \
  ...
```

3. **Start small** - test with 5-10 leads before launching large campaigns

4. **Track results** - check `/email/campaigns` after sending to monitor performance

5. **Use personalization** - pass `company_info` with relevant details to get better AI-generated emails

## Next Steps

- Read [EMAIL_AGENT_README.md](./EMAIL_AGENT_README.md) for complete API documentation
- Explore the full feature set: templates, follow-ups, scheduling
- Integrate with your frontend for UI-based campaign management
- Set up automated follow-up sequences for better conversion rates
