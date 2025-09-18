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

    # ------------------- ADMIN EMAIL -------------------
    subject_admin = f"📥 New User Registration: {reg.get('full_name')}"
    body_admin = f"""
A new user has successfully registered via the Epiconsult Clinic & Diagnostics website
as part of our World Cancer Day initiative.

Please find the user details below:

------------------------------------
👤 Full Name: {reg.get('full_name')}
📞 Phone: {reg.get('phone')}
📧 Email: {reg.get('email')}
------------------------------------

This registration is part of our ongoing efforts to provide healthcare awareness,
diagnostic services, and community engagement.

Kindly follow up as appropriate.

Best regards,

HAKEEM TOSIN  
Information & Technology Officer (ITO™)  
Epiconsult Clinic & Diagnostics Center  

📍 33, Abidjan Street, Wuse, Zone 3, Abuja  
📞 Tel: 08036691680, 09125662818  
✉ Email: tosinhakeem@epidiagnostics.com, tosinhakeem4@gmail.com  
🌐 Website: www.epidiagnostics.com  

-------------------------------------------------------------
This email and any file transmitted with it are confidential
and intended solely for the use of the individual or entity 
to whom they are addressed. If you have received this email in 
error, you should not disseminate, distribute or copy this email. 
Kindly notify the sender immediately by email and delete it from 
your system. Disclosing, copying, distributing, or taking any 
action in reliance on the contents of this information is 
strictly prohibited.
-------------------------------------------------------------
"""

    # ------------------- USER EMAIL -------------------
    subject_user = "✅ Thank you for registering with Epiconsult"
    body_user = f"""
Hi {reg.get('full_name')},

Thank you for registering with Epiconsult as part of our World Cancer Day initiative. 
We truly appreciate your interest and commitment to better health. Your registration 
ensures that you will be the first to receive updates on our programs, diagnostic 
services, and community health efforts.

Our team will review your information and contact you shortly to provide the next steps 
and any additional details you may require. In the meantime, please feel free to reach out 
to us if you have any urgent questions.

Warm regards,  
EPICONSULT TEAM ITO  
Epiconsult Clinic & Diagnostics Center  

📍 33, Abidjan Street, Wuse, Zone 3, Abuja  
📞 Tel: 07037765000, 09139374672  
✉ Email: epiconsultdiagnostics@gmail.com, epiconsultdiagnostics1@gmail.com  
🌐 Website: www.epidiagnostics.com  

-------------------------------------------------------------
This email and any file transmitted with it are confidential 
and intended solely for the use of the individual or entity 
to whom they are addressed. If you have received this email in 
error, you should not disseminate, distribute or copy this email. 
Kindly notify the sender immediately by email and delete it from 
your system. Disclosing, copying, distributing, or taking any 
action in reliance on the contents of this information is 
strictly prohibited.
-------------------------------------------------------------
"""

    # ------------------- SEND EMAILS -------------------
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
