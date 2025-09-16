"""
database.py
Handles all DB operations for World Cancer Day project.
For demo we’ll use SQLite. (Switchable to Firestore if you prefer.)
"""

import sqlite3
from pathlib import Path

DB_FILE = Path("cancer_day.db")


def init_db():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def save_registration(data):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO registrations (full_name, phone, email, address)
        VALUES (?, ?, ?, ?)
    """, (
        data.get("full_name"),
        data.get("phone"),
        data.get("email"),
        data.get("address"),
    ))
    conn.commit()
    conn.close()


# Initialize DB on import
init_db()
