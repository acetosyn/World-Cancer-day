"""
engine.py
Backend helpers: validation and email notifications
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
    Sends emails via SMTP.
    Env vars required:
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, NOTIFY_EMAIL
    """

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    email_from = os.getenv("EMAIL_FROM")
    notify_to = os.getenv("NOTIFY_EMAIL")

    if not all([smtp_host, smtp_user, smtp_pass, email_from, notify_to]):
        print("Email not sent: missing SMTP config")
        return

    subject_admin = f"New Registration: {reg.get('full_name')}"
    body_admin = (
        f"Name: {reg.get('full_name')}\n"
        f"Phone: {reg.get('phone')}\n"
        f"Email: {reg.get('email')}\n"
        f"Address: {reg.get('address') or 'N/A'}"
    )

    subject_user = "Thank you for registering!"
    body_user = (
        f"Hi {reg.get('full_name')},\n\n"
        "Thank you for signing up for World Cancer Day.\n"
        "We’ll keep you updated with more info soon."
    )

    # Send admin email
    msg_admin = MIMEText(body_admin)
    msg_admin["Subject"] = subject_admin
    msg_admin["From"] = email_from
    msg_admin["To"] = notify_to

    # Send user email
    msg_user = MIMEText(body_user)
    msg_user["Subject"] = subject_user
    msg_user["From"] = email_from
    msg_user["To"] = reg.get("email")

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(email_from, [notify_to], msg_admin.as_string())
        server.sendmail(email_from, [reg.get("email")], msg_user.as_string())

    print("Emails sent successfully")
