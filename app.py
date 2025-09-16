from flask import Flask, render_template, request, jsonify
from datetime import datetime

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

    # Simple validation (adjust as needed)
    required_fields = ["full_name", "phone", "email"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400

    try:
        # In a real project, save to DB and send emails here
        # For now, just simulate success
        return jsonify({"success": True, "message": "Registration successful"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# ENTRYPOINT
# -------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
