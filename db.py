"""
db.py
Save registrations + email logs to Supabase
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def save_registration(data):
    """Insert registration into Supabase"""
    response = supabase.table("registrations").insert({
        "full_name": data["full_name"],
        "phone": data["phone"],
        "email": data["email"]
    }).execute()

    return response


def log_email_status(registration_email: str, status: str, error_message: str = None):
    """Insert email delivery status into Supabase"""
    response = supabase.table("email_logs").insert({
        "registration_email": registration_email,
        "status": status,
        "error_message": error_message
    }).execute()
    return response


def get_all_registrations():
    """Fetch all registrations"""
    response = supabase.table("registrations").select("*").order("created_at", desc=True).execute()
    return response.data or []


def get_all_email_logs():
    """Fetch all email logs"""
    response = supabase.table("email_logs").select("*").order("created_at", desc=True).execute()
    return response.data or []
