# Backend - Lead Qualification & Email Outreach Agent

AI-powered lead qualification with CrewAI agents and automated email outreach for B2B sales teams.

## Features

- **Lead Qualification**: AI-powered lead scoring using ICP profiles
- **Email Outreach Agent**: Personalized email composition and campaign management
- **SMTP Integration**: Gmail/SMTP support with authentication
- **Campaign Management**: Create, schedule, and track email campaigns
- **Email Templates**: Reusable templates with personalization
- **Analytics**: Track email delivery, opens, and engagement

## Quick Start

1. Create venv and install deps:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and customize with your SMTP and API credentials:

```env
MONGO_URI=mongodb://localhost:27017/ai_leads
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
OPENAI_API_KEY=sk-your-key
```

3. Run the app:

```bash
python app.py
```

## API Endpoints

### Authentication
- `POST /signup` — Register user
- `POST /login` — User login
- `GET /me` — Get current user (protected)

### Lead Management
- `POST /lead/upload` — Upload CSV leads
- `GET /lead` — List leads
- `GET /lead/{id}` — Get lead details

### Lead Qualification
- `POST /qualification/qualify` — Run qualification on latest batch
- `GET /qualification/results` — Get qualification results

### ICP Management
- `POST /icp/create` — Create ICP profile
- `GET /icp` — Get active ICP

### Email Outreach (NEW!)
- `POST /email/send` — Send single email
- `POST /email/compose` — AI-generate personalized email
- `POST /email/campaigns` — Create email campaign
- `POST /email/campaigns/{id}/launch` — Launch campaign
- `GET /email/campaigns` — List campaigns
- `GET /email/history` — View email history
- `POST /email/templates` — Save email template
- `GET /email/test-smtp` — Test SMTP configuration

## Documentation

### Email Agent Documentation
- **Quick Start**: [QUICKSTART_EMAIL.md](./QUICKSTART_EMAIL.md) - 5-minute setup guide
- **Full API Reference**: [EMAIL_AGENT_README.md](./EMAIL_AGENT_README.md) - Complete feature documentation
- **Postman Collection**: `postman_collection.json` - API examples

## Workflow

```
1. Upload Leads (CSV)
   ↓
2. Create/Configure ICP Profile
   ↓
3. Run AI Qualification
   ↓
4. Create Email Campaign
   ↓
5. Launch & Track Results
```

## Database

MongoDB collections:
- `users` — User accounts
- `leads` — Lead records
- `lead_batches` — CSV import batches
- `icp_profiles` — Ideal Customer Profiles
- `qualification_results` — Lead scoring results
- `emailCampaigns` — Email campaigns
- `emailHistory` — Sent emails
- `emailTemplates` — Email templates
- `followUpSequences` — Follow-up scheduling

## Setup Email Configuration

See [QUICKSTART_EMAIL.md](./QUICKSTART_EMAIL.md) for detailed setup instructions including:
- Gmail App Password setup
- SMTP configuration
- Testing SMTP connection
- Sending first email

## Troubleshooting

**SMTP Authentication Failed**: Ensure you're using an App Password, not your regular Gmail password.

**Email Composition Failing**: Check that OPENAI_API_KEY is set. System falls back to template mode if not configured.

**Database Connection Error**: Verify MONGO_URI is correct and MongoDB is running.

## Development

For testing:
```bash
python test_email_agent.py
```

For Flask logs:
```bash
FLASK_DEBUG=1 python app.py
```

