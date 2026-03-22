"""
seed_demo_data.py
=================
Run this BEFORE your panel demo to pre-populate the database
with realistic investor records that showcase every feature.

Usage:
    python seed_demo_data.py

Requirements:
    pip install pymongo requests
"""

import hashlib
import requests
from datetime import datetime, timedelta
from pymongo import MongoClient

# ── Config ────────────────────────────────────────────────────────────────────
MONGO_URI   = "mongodb://localhost:27017"
DB_NAME     = "investment_tracker"
BACKEND_URL = "http://localhost:5000"

# ── Helpers (mirrors app.py logic exactly) ────────────────────────────────────
def safe_float(v):
    try: return float(v)
    except: return 0.0

def calculate_trust_score(d):
    return round(safe_float(d["success_rate"]) * 0.4 +
                 safe_float(d["compliance_level"]) * 0.3 +
                 safe_float(d["transparency_score"]) * 0.3, 2)

def calculate_risk_score(d):
    return round(safe_float(d["geo_risk"]) * 0.40 +
                 safe_float(d["market_volatility"]) * 0.35 +
                 safe_float(d["regulatory_instability"]) * 0.25, 2)

def decision_engine(trust, risk):
    if trust > 70 and risk < 40: return "APPROVED"
    elif risk > 70:               return "REJECTED"
    else:                         return "REVIEW"

def investment_status(trust, risk):
    if risk >= 80:    return "LOCKED"
    elif risk >= 70:  return "FROZEN"
    elif trust < 40:  return "REDIRECTED"
    else:             return "ACTIVE"

def generate_hash(data):
    s = "".join(str(data.get(k, "")) for k in [
        "name","email","country","amount","project_name","fund_type",
        "success_rate","compliance_level","transparency_score",
        "geo_risk","market_volatility","regulatory_instability",
        "trust_score","risk_score","decision","investment_status",
        "timestamp","previous_hash"
    ])
    return hashlib.sha256(s.encode()).hexdigest()

# ── Demo Investors ─────────────────────────────────────────────────────────────
# Chosen to demonstrate EVERY status: APPROVED/ACTIVE, REVIEW, REJECTED/LOCKED,
# and multiple geographies for the GeoRisk map.
DEMO_INVESTORS = [
    # 1 — High trust, low risk → APPROVED / ACTIVE
    {
        "name": "Sophia Chen",
        "email": "sophia.chen@alphaventures.sg",
        "country": "Singapore",
        "amount": 850000,
        "project_name": "Alpha Fintech Hub",
        "fund_type": "Equity",
        "success_rate": 92, "compliance_level": 95, "transparency_score": 90,
        "geo_risk": 8,  "market_volatility": 7,  "regulatory_instability": 6,
        "days_ago": 180
    },
    # 2 — Good trust, low risk → APPROVED / ACTIVE
    {
        "name": "James Okafor",
        "email": "j.okafor@meridianfund.uk",
        "country": "United Kingdom",
        "amount": 1200000,
        "project_name": "Meridian Growth Fund",
        "fund_type": "Debt",
        "success_rate": 88, "compliance_level": 85, "transparency_score": 87,
        "geo_risk": 12, "market_volatility": 10, "regulatory_instability": 9,
        "days_ago": 120
    },
    # 3 — Medium trust → REVIEW
    {
        "name": "Priya Sharma",
        "email": "priya.s@induscapital.in",
        "country": "India",
        "amount": 500000,
        "project_name": "Indus Capital Bridge",
        "fund_type": "Hybrid",
        "success_rate": 65, "compliance_level": 60, "transparency_score": 62,
        "geo_risk": 38, "market_volatility": 35, "regulatory_instability": 40,
        "days_ago": 90
    },
    # 4 — High risk country → REJECTED / FROZEN
    {
        "name": "Arash Tehrani",
        "email": "arash.t@persiainvest.ir",
        "country": "Iran",
        "amount": 320000,
        "project_name": "Persian Gulf Trade",
        "fund_type": "Equity",
        "success_rate": 55, "compliance_level": 48, "transparency_score": 50,
        "geo_risk": 72, "market_volatility": 74, "regulatory_instability": 78,
        "days_ago": 60
    },
    # 5 — Extreme risk → REJECTED / LOCKED
    {
        "name": "Omar Al-Rashid",
        "email": "omar.r@syriafund.sy",
        "country": "Syria",
        "amount": 150000,
        "project_name": "Levant Recovery Fund",
        "fund_type": "Grant",
        "success_rate": 30, "compliance_level": 25, "transparency_score": 28,
        "geo_risk": 95, "market_volatility": 92, "regulatory_instability": 94,
        "days_ago": 30
    },
    # 6 — Strong European investor → APPROVED / ACTIVE
    {
        "name": "Klaus Muller",
        "email": "k.muller@deutschfonds.de",
        "country": "Germany",
        "amount": 2000000,
        "project_name": "EuroTech Infrastructure",
        "fund_type": "Equity",
        "success_rate": 94, "compliance_level": 97, "transparency_score": 96,
        "geo_risk": 12, "market_volatility": 10, "regulatory_instability": 9,
        "days_ago": 240
    },
    # 7 — Brazil mid-risk → REVIEW
    {
        "name": "Carlos Mendes",
        "email": "c.mendes@brazilinvest.br",
        "country": "Brazil",
        "amount": 675000,
        "project_name": "Amazon Agri-Bond",
        "fund_type": "Debt",
        "success_rate": 70, "compliance_level": 65, "transparency_score": 68,
        "geo_risk": 42, "market_volatility": 48, "regulatory_instability": 45,
        "days_ago": 75
    },
    # 8 — Japan high trust → APPROVED / ACTIVE
    {
        "name": "Yuki Tanaka",
        "email": "y.tanaka@nipponasset.jp",
        "country": "Japan",
        "amount": 1500000,
        "project_name": "Nippon Smart City",
        "fund_type": "Equity",
        "success_rate": 91, "compliance_level": 93, "transparency_score": 89,
        "geo_risk": 15, "market_volatility": 12, "regulatory_instability": 10,
        "days_ago": 150
    },
]

# ── Seed Function ──────────────────────────────────────────────────────────────
def seed():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    try:
        client.server_info()
    except Exception as e:
        print(f"❌ Cannot connect to MongoDB: {e}")
        return

    db         = client[DB_NAME]
    investors  = db["investors"]
    audit_logs = db["audit_logs"]

    # Wipe existing demo data
    investors.delete_many({})
    audit_logs.delete_many({})
    print("🗑  Cleared existing data")

    prev_hash = "GENESIS"

    for i, raw in enumerate(DEMO_INVESTORS):
        days_ago  = raw.pop("days_ago")
        timestamp = (datetime.now() - timedelta(days=days_ago)).isoformat()

        trust = calculate_trust_score(raw)
        risk  = calculate_risk_score(raw)

        doc = {
            **raw,
            "amount":                 float(raw["amount"]),
            "success_rate":           float(raw["success_rate"]),
            "compliance_level":       float(raw["compliance_level"]),
            "transparency_score":     float(raw["transparency_score"]),
            "geo_risk":               float(raw["geo_risk"]),
            "market_volatility":      float(raw["market_volatility"]),
            "regulatory_instability": float(raw["regulatory_instability"]),
            "trust_score":            trust,
            "risk_score":             risk,
            "decision":               decision_engine(trust, risk),
            "investment_status":      investment_status(trust, risk),
            "timestamp":              timestamp,
            "previous_hash":          prev_hash,
        }
        doc["transaction_hash"] = generate_hash(doc)

        result    = investors.insert_one(doc)
        prev_hash = doc["transaction_hash"]

        # Create matching audit log entry
        audit_logs.insert_one({
            "timestamp":     timestamp,
            "action":        "CREATE_INVESTOR",
            "user":          "admin",
            "investor_id":   str(result.inserted_id),
            "investor_name": doc["name"],
            "changes":       {"amount": doc["amount"], "country": doc["country"]},
            "status":        "SUCCESS",
            "ip_address":    "127.0.0.1"
        })

        status_symbol = {"APPROVED":"✅","REVIEW":"🟡","REJECTED":"❌"}.get(doc["decision"], "•")
        print(f"  {status_symbol} [{i+1}/8] {doc['name']:25s} | Trust:{trust:5.1f} | Risk:{risk:5.1f} | {doc['decision']:8s} / {doc['investment_status']}")

    # Add a few extra audit events to make the log interesting
    extra_events = [
        {"action": "LOGIN",          "user": "admin",  "investor_name": None,            "status": "SUCCESS"},
        {"action": "VERIFY_HASH",    "user": "admin",  "investor_name": "Sophia Chen",   "status": "SUCCESS"},
        {"action": "REBUILD_CHAIN",  "user": "admin",  "investor_name": None,            "status": "SUCCESS"},
        {"action": "DELETE_INVESTOR","user": "admin",  "investor_name": "Test Account",  "status": "SUCCESS"},
        {"action": "UPDATE_INVESTOR","user": "admin",  "investor_name": "Priya Sharma",  "status": "SUCCESS"},
        {"action": "TAMPER_DETECTED","user": "system", "investor_name": "Omar Al-Rashid","status": "WARNING"},
    ]
    for ev in extra_events:
        audit_logs.insert_one({
            "timestamp":     (datetime.now() - timedelta(hours=2)).isoformat(),
            "action":        ev["action"],
            "user":          ev["user"],
            "investor_id":   None,
            "investor_name": ev["investor_name"],
            "changes":       None,
            "status":        ev["status"],
            "ip_address":    "127.0.0.1"
        })

    total = investors.count_documents({})
    logs  = audit_logs.count_documents({})
    print(f"\n✅ Seed complete — {total} investors, {logs} audit log entries")
    print("🚀 Start your demo at http://localhost:5173  (login: admin / invest@123)")

if __name__ == "__main__":
    seed()
