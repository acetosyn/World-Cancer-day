"""
app.py
Main Flask app for Epiconsult
Handles registration, emails, Epicare chat streaming, and admin endpoints
"""

from flask import Flask, render_template, request, Response, jsonify
from datetime import datetime
from bot import stream_epicare
from engine import validate_registration, send_registration_emails
from db import save_registration, log_email_status, get_all_registrations, get_all_email_logs

app = Flask(__name__)

# -------------------------
# ROUTES
# -------------------------
@app.route("/")
def index():
    return render_template("index.html", current_year=datetime.now().year)


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=True) or {}

    # 1. Validate
    ok, err = validate_registration(data)
    if not ok:
        return jsonify({"error": err}), 400

    try:
        # 2. Save to Supabase registrations table
        save_registration(data)

        # 3. Attempt to send emails
        email_sent = send_registration_emails(data)

        # 4. Log email status into Supabase
        log_email_status(
            registration_email=data["email"],
            status="sent" if email_sent else "failed",
            error_message=None if email_sent else "Email delivery failed"
        )

        return jsonify({"success": True, "message": "Registration successful"}), 201

    except Exception as e:
        # Log error to email_logs too
        log_email_status(
            registration_email=data.get("email", "unknown"),
            status="failed",
            error_message=str(e)
        )
        return jsonify({"error": str(e)}), 500


@app.route("/epicare")
def epicare():
    return render_template("epicare.html", current_year=datetime.now().year)


# ✅ Streaming Chat endpoint for Epicare Assistant
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    user_message = data.get("message", "")
    conversation = data.get("conversation", [])

    if not user_message.strip():
        return jsonify({"error": "Message cannot be empty"}), 400

    def generate():
        try:
            for chunk in stream_epicare(user_message, conversation):
                yield chunk
        except Exception as e:
            yield f"⚠ Error: {str(e)}"

    return Response(generate(), mimetype="text/plain")


# -------------------------
# ADMIN ENDPOINTS
# -------------------------
@app.route("/admin/registrations", methods=["GET"])
def admin_registrations():
    """Return all registrations from Supabase"""
    try:
        data = get_all_registrations()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/email-logs", methods=["GET"])
def admin_email_logs():
    """Return all email logs from Supabase"""
    try:
        data = get_all_email_logs()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# ENTRYPOINT
# -------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
