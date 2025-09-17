"""
engine.py
Validation + email notifications
"""

import os
import smtplib
from email.mime.text import MIMEText


def validate_registration(data):
    """Ensure required fields are present"""
    required = ["full_name", "phone", "email"]
    for field in required:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    return True, None


def send_registration_emails(reg):
    """
    Sends emails via Gmail SMTP with App Password.
    Env vars required:
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, NOTIFY_EMAIL
    """

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    email_from = os.getenv("EMAIL_FROM")
    notify_to = os.getenv("NOTIFY_EMAIL")

    if not all([smtp_user, smtp_pass, email_from, notify_to]):
        print("❌ Email not sent: missing SMTP config in .env")
        return False

    subject_admin = f"New Registration: {reg.get('full_name')}"
    body_admin = (
        f"📥 New registration received:\n\n"
        f"Name: {reg.get('full_name')}\n"
        f"Phone: {reg.get('phone')}\n"
        f"Email: {reg.get('email')}\n"
        f"Address: {reg.get('address') or 'N/A'}"
    )

    subject_user = "✅ Thanks for registering with Epiconsult"
    body_user = (
        f"Hi {reg.get('full_name')},\n\n"
        "Thank you for registering with Epiconsult on World Cancer Day.\n"
        "We will contact you shortly.\n\n"
        "– The Epiconsult Team"
    )

    # Build messages
    msg_admin = MIMEText(body_admin)
    msg_admin["Subject"] = subject_admin
    msg_admin["From"] = email_from
    msg_admin["To"] = notify_to

    msg_user = MIMEText(body_user)
    msg_user["Subject"] = subject_user
    msg_user["From"] = email_from
    msg_user["To"] = reg.get("email")

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(email_from, [notify_to], msg_admin.as_string())
            server.sendmail(email_from, [reg.get("email")], msg_user.as_string())
        print("✅ Emails sent successfully")
        return True
    except smtplib.SMTPAuthenticationError:
        print("❌ Invalid Gmail App Password or username. Check .env")
        return False
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False
