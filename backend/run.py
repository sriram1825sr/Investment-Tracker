# run.py - Run this instead of app.py
# This patches all missing routes and CORS into the existing app

from app import app, investors, db, safe_float, calculate_trust_score, calculate_risk_score
from app import investment_decision_engine, autonomous_investment_control
from app import generate_transaction_hash, get_country_risk_scores, create_audit_log
from flask import request, jsonify, make_response
from pymongo import MongoClient
from bson.objectid import ObjectId
import hashlib
from datetime import datetime

# ── CORS fix ──────────────────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        res = make_response()
        res.headers["Access-Control-Allow-Origin"]  = "*"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        res.status_code = 200
        return res

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def get_accounts():
    return db["investor_accounts"]

# ── AUTH LOGIN ────────────────────────────────────────────────────────────────
@app.route("/auth/login", methods=["POST"])
def auth_login():
    try:
        data      = request.json
        username  = (data.get("username") or "").strip()
        password  = data.get("password", "")
        role_hint = data.get("role", "")

        # Admin check
        if role_hint == "admin" or username == "admin":
            if username == "admin" and password == "invest@123":
                create_audit_log(action="ADMIN_LOGIN", user="admin", status="SUCCESS")
                return jsonify({"role": "admin"}), 200
            return jsonify({"error": "Invalid admin credentials"}), 401

        # Investor check
        email    = username.lower()
        accounts = get_accounts()
        account  = accounts.find_one({"email": email})

        if not account or account["password"] != hash_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        investor_id   = account.get("investor_id")
        investor_data = None
        if investor_id:
            try:
                rec = investors.find_one({"_id": ObjectId(investor_id)})
                if rec:
                    rec["_id"] = str(rec["_id"])
                    for field in ["transaction_hash","previous_hash","trust_score","risk_score",
                                  "geo_risk","market_volatility","regulatory_instability",
                                  "success_rate","compliance_level","transparency_score"]:
                        rec.pop(field, None)
                    investor_data = rec
            except:
                pass

        create_audit_log(action="INVESTOR_LOGIN", user=email,
                         investor_name=account.get("name"), status="SUCCESS")

        return jsonify({
            "role":           "investor",
            "name":           account.get("name"),
            "email":          email,
            "account_status": account.get("status", "registered"),
            "investor_id":    investor_id,
            "investor_data":  investor_data,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── INVESTOR SIGNUP ───────────────────────────────────────────────────────────
@app.route("/investor/signup", methods=["POST"])
def investor_signup():
    try:
        data     = request.json
        email    = (data.get("email") or "").strip().lower()
        password = data.get("password", "")
        name     = data.get("name", "").strip()

        if not email or not password or not name:
            return jsonify({"error": "Name, email and password are required"}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        accounts = get_accounts()
        if accounts.find_one({"email": email}):
            return jsonify({"error": "An account with this email already exists"}), 409

        accounts.insert_one({
            "email":       email,
            "name":        name,
            "password":    hash_password(password),
            "investor_id": None,
            "status":      "registered",
            "created_at":  datetime.now().isoformat(),
            "role":        "investor",
        })

        create_audit_log(action="INVESTOR_SIGNUP", user=email, investor_name=name, status="SUCCESS")
        return jsonify({"message": "Account created successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── INVESTOR SUBMIT FORM ──────────────────────────────────────────────────────
@app.route("/investor/submit_form", methods=["POST"])
def investor_submit_form():
    try:
        data  = request.json
        email = (data.get("email") or "").strip().lower()

        accounts = get_accounts()
        account  = accounts.find_one({"email": email})
        if not account:
            return jsonify({"error": "Account not found"}), 404
        if account.get("investor_id"):
            return jsonify({"error": "Investment form already submitted"}), 409

        name         = data.get("name", "").strip()
        country      = data.get("country", "").strip()
        amount       = safe_float(data.get("amount", 0))
        project_name = data.get("project_name", "").strip()
        fund_type    = data.get("fund_type", "").strip()

        if not all([name, country, amount, project_name, fund_type]):
            return jsonify({"error": "All fields are required"}), 400

        risk_scores = get_country_risk_scores(country)
        if risk_scores:
            geo_risk               = risk_scores["geo_risk"]
            market_volatility      = risk_scores["market_volatility"]
            regulatory_instability = risk_scores["regulatory_instability"]
        else:
            geo_risk = market_volatility = regulatory_instability = 50.0

        success_rate       = min(90, 50 + (amount / 100000) * 5)
        compliance_level   = 70.0
        transparency_score = 70.0

        doc_data = {
            "name": name, "email": email, "country": country,
            "amount": amount, "project_name": project_name, "fund_type": fund_type,
            "success_rate": round(success_rate, 2),
            "compliance_level": compliance_level,
            "transparency_score": transparency_score,
            "geo_risk": geo_risk,
            "market_volatility": market_volatility,
            "regulatory_instability": regulatory_instability,
        }

        trust_score = calculate_trust_score(doc_data)
        risk_score  = calculate_risk_score(doc_data)
        decision    = investment_decision_engine(trust_score, risk_score)
        inv_status  = autonomous_investment_control(trust_score, risk_score)

        last_block    = investors.find_one(sort=[("_id", -1)])
        previous_hash = last_block["transaction_hash"] if last_block else "GENESIS"
        timestamp     = datetime.now().isoformat()

        investor_doc = {
            **doc_data,
            "trust_score": trust_score, "risk_score": risk_score,
            "decision": decision, "investment_status": inv_status,
            "timestamp": timestamp, "previous_hash": previous_hash,
            "submitted_by": "investor_self",
        }
        investor_doc["transaction_hash"] = generate_transaction_hash(investor_doc)

        result      = investors.insert_one(investor_doc)
        investor_id = str(result.inserted_id)

        account_status = "approved" if decision == "APPROVED" else \
                         "rejected" if decision == "REJECTED" else "pending"

        accounts.update_one({"email": email}, {"$set": {
            "investor_id": investor_id,
            "status":      account_status,
            "decision":    decision,
        }})

        create_audit_log(action="INVESTOR_FORM_SUBMITTED", user=email,
                         investor_id=investor_id, investor_name=name,
                         changes={"decision": decision}, status="SUCCESS")

        return jsonify({
            "message":     "Application submitted",
            "decision":    decision,
            "status":      account_status,
            "investor_id": investor_id,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── INVESTOR STATUS ───────────────────────────────────────────────────────────
@app.route("/investor/status/<email>", methods=["GET"])
def investor_status(email):
    try:
        email    = email.strip().lower()
        accounts = get_accounts()
        account  = accounts.find_one({"email": email})
        if not account:
            return jsonify({"error": "Account not found"}), 404

        investor_id   = account.get("investor_id")
        investor_data = None
        if investor_id:
            try:
                rec = investors.find_one({"_id": ObjectId(investor_id)})
                if rec:
                    rec["_id"] = str(rec["_id"])
                    for field in ["transaction_hash","previous_hash","trust_score","risk_score",
                                  "geo_risk","market_volatility","regulatory_instability",
                                  "success_rate","compliance_level","transparency_score"]:
                        rec.pop(field, None)
                    investor_data = rec
            except:
                pass

        return jsonify({
            "account_status": account.get("status", "registered"),
            "investor_id":    investor_id,
            "investor_data":  investor_data,
            "decision":       account.get("decision"),
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── RUN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Starting with investor portal routes...")
    app.run(debug=True, host="0.0.0.0", port=5000)
