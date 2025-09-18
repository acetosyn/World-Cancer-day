"""
db.py
Save registrations + email logs to Supabase
Also backup users.json + users.xlsx locally AND upload Excel to Supabase Storage
"""

import os
import json
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Local file paths
JSON_FILE = "users.json"
EXCEL_FILE = "users.xlsx"


def save_registration(data):
    """Insert registration into Supabase + backup to local + upload to Storage"""
    try:
        response = supabase.table("registrations").insert({
            "full_name": data["full_name"],
            "phone": data["phone"],
            "email": data["email"]
        }).execute()

        # Handle duplicate error
        if hasattr(response, "error") and response.error:
            if "duplicate key" in str(response.error).lower():
                raise ValueError("This email is already registered with us.")
            raise Exception(response.error)

        # Save local backups
        backup_users()

        print("✅ Saved to Supabase:", response.data)
        return response

    except Exception as e:
        err_msg = str(e)
        if "23505" in err_msg or "duplicate key" in err_msg:
            raise ValueError("This email is already registered with us.")
        print("❌ Failed to save registration:", e)
        raise


def backup_users():
    """Fetch all users → save to JSON + Excel → upload Excel to Supabase Storage"""
    try:
        # Fetch fresh data from Supabase
        users = get_all_registrations()

        # Write JSON
        with open(JSON_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)

        # Write Excel
        df = pd.DataFrame(users)
        df.to_excel(EXCEL_FILE, index=False)

        print(f"💾 Local backup updated → {JSON_FILE}, {EXCEL_FILE}")

        # Upload Excel to Supabase Storage
        with open(EXCEL_FILE, "rb") as f:
            supabase.storage.from_("backups").upload(
                path=EXCEL_FILE,  # file name inside bucket
                file=f,
                file_options={"content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                upsert=True,  # overwrite if already exists
            )
        print("☁️ Excel uploaded to Supabase Storage bucket 'backups'")

    except Exception as e:
        print("⚠️ Backup failed:", e)


def log_email_status(registration_email: str, status: str, error_message: str = None):
    """Insert email delivery status into Supabase"""
    try:
        response = supabase.table("email_logs").insert({
            "registration_email": registration_email,
            "status": status,
            "error_message": error_message
        }).execute()
        print("📧 Logged email status:", response.data)
        return response
    except Exception as e:
        print("❌ Failed to log email status:", e)
        raise


def get_all_registrations():
    """Fetch all registrations"""
    response = supabase.table("registrations").select("*").order("created_at", desc=True).execute()
    return response.data or []


def get_all_email_logs():
    """Fetch all email logs"""
    response = supabase.table("email_logs").select("*").order("created_at", desc=True).execute()
    return response.data or []
