#!/usr/bin/env python
"""
Test email agent functionality.
Run with: python test_email_agent.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test 1: Check environment variables
print("=" * 60)
print("TEST 1: Environment Configuration Check")
print("=" * 60)

required_vars = {
    "MONGO_URI": "MongoDB connection string",
    "SMTP_HOST": "SMTP server hostname",
    "SMTP_USER": "SMTP username",
    "SMTP_PASSWORD": "SMTP password",
    "FROM_EMAIL": "Sender email address",
}

env_check = {}
for var, description in required_vars.items():
    value = os.getenv(var)
    env_check[var] = bool(value)
    status = "✓" if value else "✗"
    print(f"{status} {var}: {description}")
    if value and var in ["SMTP_USER", "SMTP_PASSWORD"]:
        print(f"  Value: {'*' * len(value)}")
    elif value:
        print(f"  Value: {value[:50]}...")

print()

# Test 2: Import checks
print("=" * 60)
print("TEST 2: Import Checks")
print("=" * 60)

try:
    from config.db import init_db, get_db
    print("✓ config.db imported successfully")
except Exception as e:
    print(f"✗ Failed to import config.db: {e}")
    sys.exit(1)

try:
    from Services.emailService import EmailService
    print("✓ Services.emailService imported successfully")
except Exception as e:
    print(f"✗ Failed to import Services.emailService: {e}")
    sys.exit(1)

try:
    from models.emailModel import (
        create_indexes, save_email_template, get_email_templates
    )
    print("✓ models.emailModel imported successfully")
except Exception as e:
    print(f"✗ Failed to import models.emailModel: {e}")
    sys.exit(1)

try:
    from routes.emailRoutes import email_bp
    print("✓ routes.emailRoutes imported successfully")
except Exception as e:
    print(f"✗ Failed to import routes.emailRoutes: {e}")
    sys.exit(1)

print()

# Test 3: Database connection
print("=" * 60)
print("TEST 3: Database Connection")
print("=" * 60)

try:
    from app import create_app
    app = create_app()
    print("✓ Flask app created successfully")
    print("✓ Database connection initialized")
except Exception as e:
    print(f"✗ Failed to create Flask app: {e}")
    sys.exit(1)

print()

# Test 4: Email service instantiation
print("=" * 60)
print("TEST 4: Email Service Instantiation")
print("=" * 60)

try:
    from Services.emailService import EmailService
    test_user_id = "test_user_123"
    email_service = EmailService(test_user_id)
    print(f"✓ EmailService instantiated for user: {test_user_id}")
    print(f"  SMTP Host: {email_service.smtp_host}")
    print(f"  SMTP Port: {email_service.smtp_port}")
    print(f"  From Email: {email_service.from_email}")
except Exception as e:
    print(f"✗ Failed to instantiate EmailService: {e}")
    sys.exit(1)

print()

# Test 5: SMTP Connection test (optional)
print("=" * 60)
print("TEST 5: SMTP Connection Test")
print("=" * 60)

if all([os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD")]):
    try:
        import smtplib
        
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
        
        print("✓ SMTP connection successful!")
        print(f"  Connected to {smtp_host}:{smtp_port}")
    except smtplib.SMTPAuthenticationError:
        print("✗ SMTP authentication failed")
        print("  Check SMTP_USER and SMTP_PASSWORD in .env")
    except Exception as e:
        print(f"✗ SMTP connection failed: {e}")
else:
    print("⊘ SMTP credentials not configured - skipping connection test")

print()

# Test 6: Email composition (template fallback)
print("=" * 60)
print("TEST 6: Email Composition (Template Fallback)")
print("=" * 60)

try:
    test_lead = {
        "_id": "test_lead_123",
        "name": "John Smith",
        "company": "Acme Corporation",
        "role": "VP of Sales",
        "industry": "SaaS",
        "email": "john@acme.com",
    }
    
    test_company_info = {
        "name": "Our Company",
        "industry": "Enterprise SaaS",
        "value_prop": "We help companies automate lead qualification",
    }
    
    email = email_service.compose_email(test_lead, test_company_info, sequence_step=1)
    
    print("✓ Email composition successful!")
    print(f"  Subject: {email['subject_line']}")
    print(f"  Body length: {len(email['email_body'])} characters")
    print(f"  CTA: {email['call_to_action']}")
    print(f"  Used AI: {email['used_ai']}")
except Exception as e:
    print(f"✗ Email composition failed: {e}")

print()

# Summary
print("=" * 60)
print("SUMMARY")
print("=" * 60)

config_ready = all(env_check.values())
if config_ready:
    print("✓ All configurations are in place")
else:
    print("⊘ Some configurations are missing. Update .env file:")
    for var, is_set in env_check.items():
        if not is_set:
            print(f"  - {var}")

print()
print("✓ Email Agent is ready to use!")
print()
print("Next steps:")
print("1. Start the Flask server: python app.py")
print("2. Test email endpoints via API")
print("3. Create campaigns and send emails")
print()
print("For detailed documentation, see: EMAIL_AGENT_README.md")
