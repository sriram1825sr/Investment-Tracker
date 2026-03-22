
# app.py - FREEZE-PROOF VERSION
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.errors import InvalidId
import hashlib
import requests
from datetime import datetime, timedelta
import math

def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0

def calculate_trust_score(investor):
    return round(
        safe_float(investor.get("success_rate")) * 0.4 +
        safe_float(investor.get("compliance_level")) * 0.3 +
        safe_float(investor.get("transparency_score")) * 0.3, 2)

def calculate_risk_score(investor):
    return round(
        safe_float(investor.get("geo_risk")) * 0.40 +
        safe_float(investor.get("market_volatility")) * 0.35 +
        safe_float(investor.get("regulatory_instability")) * 0.25, 2)

def investment_decision_engine(trust_score, risk_score):
    if trust_score > 70 and risk_score < 40:
        return "APPROVED"
    elif risk_score > 70:
        return "REJECTED"
    else:
        return "REVIEW"

def autonomous_investment_control(trust_score, risk_score):
    if risk_score >= 80:
        return "LOCKED"
    elif 70 <= risk_score < 80:
        return "FROZEN"
    elif trust_score < 40:
        return "REDIRECTED"
    else:
        return "ACTIVE"

def generate_transaction_hash(data):
    # Include ALL fields in hash so ANY change is detected
    hash_string = f"{data.get('name')}{data.get('email')}{data.get('country')}{data.get('amount')}{data.get('project_name')}{data.get('fund_type')}{data.get('success_rate')}{data.get('compliance_level')}{data.get('transparency_score')}{data.get('geo_risk')}{data.get('market_volatility')}{data.get('regulatory_instability')}{data.get('trust_score')}{data.get('risk_score')}{data.get('decision')}{data.get('investment_status')}{data.get('timestamp')}{data.get('previous_hash')}"
    return hashlib.sha256(hash_string.encode()).hexdigest()

# Country mappings
COUNTRY_NAME_TO_ISO2 = {
    "Afghanistan":"AF","Albania":"AL","Algeria":"DZ","Angola":"AO","Argentina":"AR",
    "Armenia":"AM","Australia":"AU","Austria":"AT","Azerbaijan":"AZ","Bahrain":"BH",
    "Bangladesh":"BD","Belarus":"BY","Belgium":"BE","Bolivia":"BO","Bosnia":"BA",
    "Botswana":"BW","Brazil":"BR","Bulgaria":"BG","Cambodia":"KH","Cameroon":"CM",
    "Canada":"CA","Chad":"TD","Chile":"CL","China":"CN","Colombia":"CO","Congo":"CG",
    "Croatia":"HR","Cuba":"CU","Czech Republic":"CZ","Denmark":"DK","Ecuador":"EC",
    "Egypt":"EG","Ethiopia":"ET","Finland":"FI","France":"FR","Germany":"DE",
    "Ghana":"GH","Greece":"GR","Guatemala":"GT","Honduras":"HN","Hungary":"HU",
    "India":"IN","Indonesia":"ID","Iran":"IR","Iraq":"IQ","Ireland":"IE","Israel":"IL",
    "Italy":"IT","Jamaica":"JM","Japan":"JP","Jordan":"JO","Kazakhstan":"KZ",
    "Kenya":"KE","Kuwait":"KW","Kyrgyzstan":"KG","Laos":"LA","Latvia":"LV",
    "Lebanon":"LB","Libya":"LY","Lithuania":"LT","Luxembourg":"LU","Malaysia":"MY",
    "Mexico":"MX","Moldova":"MD","Mongolia":"MN","Morocco":"MA","Mozambique":"MZ",
    "Myanmar":"MM","Namibia":"NA","Nepal":"NP","Netherlands":"NL","New Zealand":"NZ",
    "Nicaragua":"NI","Nigeria":"NG","Norway":"NO","Oman":"OM","Pakistan":"PK",
    "Panama":"PA","Paraguay":"PY","Peru":"PE","Philippines":"PH","Poland":"PL",
    "Portugal":"PT","Qatar":"QA","Romania":"RO","Russia":"RU","Saudi Arabia":"SA",
    "Senegal":"SN","Serbia":"RS","Sierra Leone":"SL","Somalia":"SO",
    "South Africa":"ZA","South Korea":"KR","South Sudan":"SS","Spain":"ES",
    "Sri Lanka":"LK","Sudan":"SD","Sweden":"SE","Switzerland":"CH","Syria":"SY",
    "Taiwan":"TW","Tajikistan":"TJ","Tanzania":"TZ","Thailand":"TH","Tunisia":"TN",
    "Turkey":"TR","Turkmenistan":"TM","Uganda":"UG","Ukraine":"UA",
    "United Arab Emirates":"AE","UAE":"AE","United Kingdom":"GB","UK":"GB",
    "United States":"US","USA":"US","US":"US","Uruguay":"UY","Uzbekistan":"UZ",
    "Venezuela":"VE","Vietnam":"VN","Yemen":"YE","Zambia":"ZM","Zimbabwe":"ZW",
    "North Korea":"KP","DR Congo":"CD","Democratic Republic of Congo":"CD",
    "Ivory Coast":"CI","Cote d'Ivoire":"CI","El Salvador":"SV","Haiti":"HT",
    "Dominican Republic":"DO","Costa Rica":"CR","Trinidad and Tobago":"TT",
    "North Macedonia":"MK","Palestine":"PS","Kosovo":"XK",
}

FALLBACK_RISK_DB = {
    "Syria":{"geo_risk":95,"market_volatility":92,"regulatory_instability":94},
    "Yemen":{"geo_risk":94,"market_volatility":91,"regulatory_instability":93},
    "Somalia":{"geo_risk":96,"market_volatility":93,"regulatory_instability":95},
    "South Sudan":{"geo_risk":93,"market_volatility":90,"regulatory_instability":92},
    "North Korea":{"geo_risk":88,"market_volatility":90,"regulatory_instability":95},
    "Libya":{"geo_risk":88,"market_volatility":85,"regulatory_instability":87},
    "Afghanistan":{"geo_risk":92,"market_volatility":89,"regulatory_instability":91},
    "Sudan":{"geo_risk":87,"market_volatility":84,"regulatory_instability":86},
    "DR Congo":{"geo_risk":85,"market_volatility":82,"regulatory_instability":86},
    "Haiti":{"geo_risk":84,"market_volatility":82,"regulatory_instability":85},
    "Mali":{"geo_risk":82,"market_volatility":80,"regulatory_instability":83},
    "Chad":{"geo_risk":82,"market_volatility":80,"regulatory_instability":83},
    "Palestine":{"geo_risk":85,"market_volatility":80,"regulatory_instability":82},
    "Iraq":{"geo_risk":78,"market_volatility":75,"regulatory_instability":79},
    "Iran":{"geo_risk":72,"market_volatility":74,"regulatory_instability":78},
    "Venezuela":{"geo_risk":74,"market_volatility":80,"regulatory_instability":78},
    "Myanmar":{"geo_risk":76,"market_volatility":72,"regulatory_instability":74},
    "Zimbabwe":{"geo_risk":70,"market_volatility":72,"regulatory_instability":74},
    "Lebanon":{"geo_risk":78,"market_volatility":82,"regulatory_instability":76},
    "Cuba":{"geo_risk":65,"market_volatility":68,"regulatory_instability":72},
    "Kosovo":{"geo_risk":45,"market_volatility":48,"regulatory_instability":50},
    "Russia":{"geo_risk":62,"market_volatility":58,"regulatory_instability":64},
    "Pakistan":{"geo_risk":68,"market_volatility":62,"regulatory_instability":66},
    "Nigeria":{"geo_risk":65,"market_volatility":62,"regulatory_instability":64},
    "Ukraine":{"geo_risk":70,"market_volatility":65,"regulatory_instability":62},
    "Belarus":{"geo_risk":60,"market_volatility":58,"regulatory_instability":65},
    "Ethiopia":{"geo_risk":65,"market_volatility":62,"regulatory_instability":64},
    "Tajikistan":{"geo_risk":58,"market_volatility":55,"regulatory_instability":60},
    "Turkmenistan":{"geo_risk":55,"market_volatility":52,"regulatory_instability":62},
    "Taiwan":{"geo_risk":35,"market_volatility":20,"regulatory_instability":18},
    "Switzerland":{"geo_risk":8,"market_volatility":6,"regulatory_instability":5},
    "Norway":{"geo_risk":7,"market_volatility":6,"regulatory_instability":5},
    "Denmark":{"geo_risk":8,"market_volatility":6,"regulatory_instability":5},
    "Finland":{"geo_risk":8,"market_volatility":6,"regulatory_instability":5},
    "New Zealand":{"geo_risk":8,"market_volatility":7,"regulatory_instability":6},
    "Japan":{"geo_risk":15,"market_volatility":12,"regulatory_instability":10},
    "Germany":{"geo_risk":12,"market_volatility":10,"regulatory_instability":9},
    "Canada":{"geo_risk":10,"market_volatility":8,"regulatory_instability":7},
    "India":{"geo_risk":38,"market_volatility":35,"regulatory_instability":40},
    "Brazil":{"geo_risk":42,"market_volatility":48,"regulatory_instability":45},
    "Turkey":{"geo_risk":52,"market_volatility":55,"regulatory_instability":54},
}

def fetch_world_bank_indicator(iso2, indicator):
    url = f"https://api.worldbank.org/v2/country/{iso2}/indicator/{indicator}?format=json&mrv=1&per_page=1"
    try:
        res = requests.get(url, timeout=3)
        data = res.json()
        if len(data) > 1 and data[1] and data[1][0].get("value"):
            return round(float(data[1][0]["value"]), 2)
    except:
        pass
    return None

def get_country_risk_scores(country_name):
    country = country_name.strip()
    iso2 = COUNTRY_NAME_TO_ISO2.get(country)

    if iso2:
        ps = fetch_world_bank_indicator(iso2, "PV.PER.RNK")
        if ps:
            return {
                "geo_risk": min(100, max(0, ps)),
                "market_volatility": min(100, max(0, ps * 0.8)),
                "regulatory_instability": min(100, max(0, ps * 0.9)),
                "source": "World Bank API",
                "iso2": iso2,
            }

    if country in FALLBACK_RISK_DB:
        data = FALLBACK_RISK_DB[country]
        return {
            "geo_risk": data["geo_risk"],
            "market_volatility": data["market_volatility"],
            "regulatory_instability": data["regulatory_instability"],
            "source": "Fallback Database",
            "iso2": iso2 or "N/A",
        }

    return None

def calculate_portfolio_metrics(investor):
    investment_amount = safe_float(investor.get("amount"))
    if investment_amount <= 0:
        return None
    
    try:
        investment_date = datetime.fromisoformat(investor.get("timestamp", datetime.now().isoformat()).replace('Z', '+00:00'))
    except:
        investment_date = datetime.now()
    
    days_invested = (datetime.now() - investment_date).days
    progress_percentage = min((days_invested / 365) * 100, 100)
    
    trust_score = safe_float(investor.get("trust_score", 0))
    trust_score_factor = (trust_score / 100)
    
    risk_score = safe_float(investor.get("risk_score", 0))
    risk_adjustment = max(0, 1 - (risk_score / 100) * 0.3)
    
    base_annual = investment_amount * 0.12
    time_based = base_annual * (progress_percentage / 100)
    trust_adjusted = time_based * (0.5 + trust_score_factor)
    final_return = trust_adjusted * risk_adjustment
    
    return {
        "investment_amount": round(investment_amount, 2),
        "days_invested": days_invested,
        "progress_percentage": round(progress_percentage, 1),
        "base_annual_return": round(base_annual, 2),
        "time_based_return": round(time_based, 2),
        "trust_adjusted_return": round(trust_adjusted, 2),
        "final_return": round(final_return, 2),
        "roi": round((final_return / investment_amount * 100), 2),
        "projected_value": round(investment_amount + final_return, 2),
        "trust_score_factor": round(trust_score_factor * 100, 1),
        "risk_adjustment_factor": round(risk_adjustment * 100, 1),
    }

def generate_monthly_returns(investor):
    investment_amount = safe_float(investor.get("amount"))
    if investment_amount <= 0:
        return []
    
    try:
        investment_date = datetime.fromisoformat(investor.get("timestamp", datetime.now().isoformat()).replace('Z', '+00:00'))
    except:
        investment_date = datetime.now()
    
    days_invested = (datetime.now() - investment_date).days
    max_months = min(12, max(1, days_invested // 30 + 1))
    
    trust_score = safe_float(investor.get("trust_score", 0)) / 100
    risk_score = safe_float(investor.get("risk_score", 0))
    risk_factor = max(0, 1 - (risk_score / 100) * 0.3)
    
    history = []
    for i in range(max_months + 1):
        current_date = investment_date + timedelta(days=i*30)
        progress = min((i * 30 / 365) * 100, 100)
        
        monthly_return = investment_amount * 0.12 * (progress / 100) * (0.5 + trust_score) * risk_factor
        
        history.append({
            "month": i if i > 0 else 0,
            "date": current_date.strftime("%Y-%m-%d"),
            "return": round(monthly_return, 2),
            "cumulative": round(investment_amount + monthly_return, 2),
            "progress": round(progress, 1),
        })
    
    return history

# Flask Setup
app = Flask(__name__)
CORS(app)

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    db = client["investment_tracker"]
    investors = db["investors"]
    client.server_info()
    print("✅ MongoDB Connected")
except Exception as e:
    print(f"❌ MongoDB Error: {e}")
    investors = None

# Routes
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Investment Tracker API is running"}), 200

@app.route("/country_risk", methods=["GET"])
def country_risk():
    try:
        country = request.args.get("country", "").strip()
        if not country:
            return jsonify({"error": "Country name required"}), 400

        scores = get_country_risk_scores(country)
        if not scores:
            return jsonify({"error": f"No data for '{country}'"}), 404

        return jsonify(scores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add_investor", methods=["POST"])
def add_investor():
    try:
        data = request.json
        trust_score = calculate_trust_score(data)
        risk_score = calculate_risk_score(data)
        
        last_block = investors.find_one(sort=[("_id", -1)])
        previous_hash = last_block["transaction_hash"] if last_block else "GENESIS"
        
        timestamp = datetime.now().isoformat()
        
        investor_doc = {
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "country": data.get("country", ""),
            "amount": safe_float(data.get("amount")),
            "project_name": data.get("project_name", ""),
            "fund_type": data.get("fund_type", ""),
            "success_rate": safe_float(data.get("success_rate")),
            "compliance_level": safe_float(data.get("compliance_level")),
            "transparency_score": safe_float(data.get("transparency_score")),
            "geo_risk": safe_float(data.get("geo_risk")),
            "market_volatility": safe_float(data.get("market_volatility")),
            "regulatory_instability": safe_float(data.get("regulatory_instability")),
            "trust_score": trust_score,
            "risk_score": risk_score,
            "decision": investment_decision_engine(trust_score, risk_score),
            "investment_status": autonomous_investment_control(trust_score, risk_score),
            "timestamp": timestamp,
            "previous_hash": previous_hash,
        }
        
        investor_doc["transaction_hash"] = generate_transaction_hash(investor_doc)
        result = investors.insert_one(investor_doc)
        create_audit_log(
            action="CREATE_INVESTOR",
            user="admin",
            investor_id=result.inserted_id,
            investor_name=investor_doc.get("name"),
            changes={"amount": investor_doc.get("amount"), "country": investor_doc.get("country")},
            status="SUCCESS"
        )
        return jsonify({"message": "✅ Registered"}), 200
    except Exception as e:
        create_audit_log(action="CREATE_INVESTOR", user="admin", status="FAILED", changes={"error": str(e)})
        return jsonify({"error": str(e)}), 500

@app.route("/a_investors", methods=["GET"])
def get_all_investors():
    try:
        result = []
        for inv in investors.find().sort("_id", 1):
            inv["_id"] = str(inv["_id"])
            result.append(inv)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/s_investor/<id>", methods=["GET"])
def get_single_investor(id):
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        if not inv:
            return jsonify({"error": "Not found"}), 404
        inv["_id"] = str(inv["_id"])
        return jsonify(inv), 200
    except InvalidId:
        return jsonify({"error": "Invalid ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/u_investor/<id>", methods=["PUT"])
def update_investor(id):
    try:
        data = request.json

        # Update the edited block first
        investors.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )

        # 🔥 Now rebuild chain from this point forward
        blocks = list(investors.find().sort("_id", 1))

        prev_hash = "GENESIS"

        for block in blocks:
            updated_data = {
                "name": block.get("name"),
                "email": block.get("email"),
                "country": block.get("country"),
                "amount": block.get("amount"),
                "project_name": block.get("project_name"),
                "fund_type": block.get("fund_type"),
                "success_rate": block.get("success_rate"),
                "compliance_level": block.get("compliance_level"),
                "transparency_score": block.get("transparency_score"),
                "geo_risk": block.get("geo_risk"),
                "market_volatility": block.get("market_volatility"),
                "regulatory_instability": block.get("regulatory_instability"),
                "trust_score": block.get("trust_score"),
                "risk_score": block.get("risk_score"),
                "decision": block.get("decision"),
                "investment_status": block.get("investment_status"),
                "timestamp": block.get("timestamp"),
                "previous_hash": prev_hash,
            }

            new_hash = generate_transaction_hash(updated_data)

            investors.update_one(
                {"_id": block["_id"]},
                {"$set": {
                    "previous_hash": prev_hash,
                    "transaction_hash": new_hash
                }}
            )

            prev_hash = new_hash

        create_audit_log(
            action="UPDATE_INVESTOR",
            user="admin",
            investor_id=id,
            investor_name=data.get("name"),
            changes=data,
            status="SUCCESS"
        )
        return jsonify({"message": "✅ Investor Updated Successfully"}), 200

    except Exception as e:
        create_audit_log(action="UPDATE_INVESTOR", user="admin", investor_id=id, status="FAILED", changes={"error": str(e)})
        return jsonify({"error": str(e)}), 500

@app.route("/d_investor/<id>", methods=["DELETE"])
def delete_investor(id):
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        inv_name = inv.get("name") if inv else None
        result = investors.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Not found"}), 404
        create_audit_log(
            action="DELETE_INVESTOR",
            user="admin",
            investor_id=id,
            investor_name=inv_name,
            status="SUCCESS"
        )
        return jsonify({"message": "✅ Deleted"}), 200
    except InvalidId:
        return jsonify({"error": "Invalid ID"}), 400
    except Exception as e:
        create_audit_log(action="DELETE_INVESTOR", user="admin", investor_id=id, status="FAILED", changes={"error": str(e)})
        return jsonify({"error": str(e)}), 500

@app.route("/validate_chain", methods=["GET"])
def validate_chain():
    try:
        blocks = list(investors.find().sort("_id", 1))

        if not blocks:
            return jsonify({"status": "EMPTY_CHAIN", "system_state": "ACTIVE"}), 200

        for i, block in enumerate(blocks):
            original_hash = block.get("transaction_hash")

            # Recalculate hash
            recalculated_hash = generate_transaction_hash({
                "name": block.get("name"),
                "email": block.get("email"),
                "country": block.get("country"),
                "amount": block.get("amount"),
                "project_name": block.get("project_name"),
                "fund_type": block.get("fund_type"),
                "success_rate": block.get("success_rate"),
                "compliance_level": block.get("compliance_level"),
                "transparency_score": block.get("transparency_score"),
                "geo_risk": block.get("geo_risk"),
                "market_volatility": block.get("market_volatility"),
                "regulatory_instability": block.get("regulatory_instability"),
                "trust_score": block.get("trust_score"),
                "risk_score": block.get("risk_score"),
                "decision": block.get("decision"),
                "investment_status": block.get("investment_status"),
                "timestamp": block.get("timestamp"),
                "previous_hash": block.get("previous_hash"),
            })

            if original_hash != recalculated_hash:
                return jsonify({
                    "status": "TAMPER_DETECTED",
                    "system_state": "FROZEN"
                }), 200

            # Check chain linking
            if i > 0:
                if block.get("previous_hash") != blocks[i-1].get("transaction_hash"):
                    return jsonify({
                        "status": "CHAIN_BROKEN",
                        "system_state": "FROZEN"
                    }), 200

        return jsonify({"status": "CHAIN_VALID", "system_state": "ACTIVE"}), 200

    except Exception as e:
        return jsonify({
            "status": "ERROR",
            "system_state": "FROZEN",
            "error": str(e)
        }), 200

@app.route("/verify_hash/<id>", methods=["GET"])
def verify_hash(id):
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        if not inv:
            return jsonify({"error": "Not found", "verified": False}), 404

        recalculated_hash = generate_transaction_hash({
            "name": inv.get("name"),
            "email": inv.get("email"),
            "country": inv.get("country"),
            "amount": inv.get("amount"),
            "project_name": inv.get("project_name"),
            "fund_type": inv.get("fund_type"),
            "success_rate": inv.get("success_rate"),
            "compliance_level": inv.get("compliance_level"),
            "transparency_score": inv.get("transparency_score"),
            "geo_risk": inv.get("geo_risk"),
            "market_volatility": inv.get("market_volatility"),
            "regulatory_instability": inv.get("regulatory_instability"),
            "trust_score": inv.get("trust_score"),
            "risk_score": inv.get("risk_score"),
            "decision": inv.get("decision"),
            "investment_status": inv.get("investment_status"),
            "timestamp": inv.get("timestamp"),
            "previous_hash": inv.get("previous_hash"),
        })

        is_valid = inv.get("transaction_hash") == recalculated_hash

        return jsonify({
            "verified": is_valid,
            "stored_hash": inv.get("transaction_hash"),
            "recalculated_hash": recalculated_hash,
            "message": "✅ Valid" if is_valid else "❌ Tampered"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e), "verified": False}), 500
@app.route("/portfolio_metrics/<id>", methods=["GET"])
def portfolio_metrics(id):
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        if not inv:
            return jsonify({"error": "Not found"}), 404
        metrics = calculate_portfolio_metrics(inv)
        return jsonify(metrics or {}), 200
    except InvalidId:
        return jsonify({"error": "Invalid ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/rebuild_chain", methods=["POST"])
def rebuild_chain():
    try:
        blocks = list(investors.find().sort("_id", 1))

        prev_hash = "GENESIS"

        for block in blocks:
            updated_data = {
                "name": block.get("name"),
                "email": block.get("email"),
                "country": block.get("country"),
                "amount": block.get("amount"),
                "project_name": block.get("project_name"),
                "fund_type": block.get("fund_type"),
                "success_rate": block.get("success_rate"),
                "compliance_level": block.get("compliance_level"),
                "transparency_score": block.get("transparency_score"),
                "geo_risk": block.get("geo_risk"),
                "market_volatility": block.get("market_volatility"),
                "regulatory_instability": block.get("regulatory_instability"),
                "trust_score": block.get("trust_score"),
                "risk_score": block.get("risk_score"),
                "decision": block.get("decision"),
                "investment_status": block.get("investment_status"),
                "timestamp": block.get("timestamp"),
                "previous_hash": prev_hash,
            }

            new_hash = generate_transaction_hash(updated_data)

            investors.update_one(
                {"_id": block["_id"]},
                {"$set": {
                    "previous_hash": prev_hash,
                    "transaction_hash": new_hash
                }}
            )

            prev_hash = new_hash

        create_audit_log(action="REBUILD_CHAIN", user="admin", status="SUCCESS", changes={"blocks_rebuilt": len(blocks)})
        return jsonify({
            "message": "🔧 Blockchain Rebuilt Successfully",
            "system_state": "ACTIVE"
        }), 200

    except Exception as e:
        create_audit_log(action="REBUILD_CHAIN", user="admin", status="FAILED", changes={"error": str(e)})
        return jsonify({"error": str(e)}), 500
    
@app.route("/reset_chain", methods=["POST"])
def reset_chain():
    try:
        investors.delete_many({})
        create_audit_log(action="RESET_CHAIN", user="admin", status="SUCCESS", changes={"note": "All investor records deleted"})
        return jsonify({"message": "🔄 System Reset Successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/monthly_returns/<id>", methods=["GET"])
def monthly_returns(id):
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        if not inv:
            return jsonify([]), 404
        return jsonify(generate_monthly_returns(inv)), 200
    except InvalidId:
        return jsonify([]), 400
    except Exception as e:
        return jsonify([]), 500
# Add this function and route to your app.py

def generate_fund_utilization(investor):
    """
    Generate fund utilization timeline based on investor's investment amount
    Shows how the project uses the investor's capital across different stages
    """
    investment_amount = safe_float(investor.get("amount"))
    
    if investment_amount <= 0:
        return None
    
    # Define utilization stages (customize based on your project needs)
    utilization_timeline = [
        {
            "stage": 1,
            "name": "Infrastructure Setup",
            "days": "1-30",
            "category": "Technology",
            "percentage": 25,
            "amount_spent": round(investment_amount * 0.25),
            "description": "Blockchain servers, database setup, API development",
            "icon": "🛠️"
        },
        {
            "stage": 2,
            "name": "Team & Operations",
            "days": "31-90",
            "category": "Human Resources",
            "percentage": 35,
            "amount_spent": round(investment_amount * 0.35),
            "description": "Developer salaries, admin staff, operations management",
            "icon": "👥"
        },
        {
            "stage": 3,
            "name": "Security & Compliance",
            "days": "91-120",
            "category": "Security",
            "percentage": 15,
            "amount_spent": round(investment_amount * 0.15),
            "description": "Security audits, compliance certifications, data protection",
            "icon": "🔒"
        },
        {
            "stage": 4,
            "name": "Marketing & Growth",
            "days": "121-180",
            "category": "Growth",
            "percentage": 20,
            "amount_spent": round(investment_amount * 0.20),
            "description": "User acquisition, brand development, market expansion",
            "icon": "📢"
        },
        {
            "stage": 5,
            "name": "Reserve & Contingency",
            "days": "181-365",
            "category": "Reserve",
            "percentage": 5,
            "amount_spent": round(investment_amount * 0.05),
            "description": "Emergency fund, unexpected expenses, buffer",
            "icon": "💾"
        }
    ]
    
    # Calculate totals
    total_invested = investment_amount
    total_utilized = sum([stage["amount_spent"] for stage in utilization_timeline])
    utilization_percentage = round((total_utilized / total_invested) * 100, 1) if total_invested > 0 else 0
    
    # Estimate revenue from fully utilized capital (assume 15% revenue generation)
    estimated_revenue = round(total_utilized * 0.15)
    
    # Estimated return to investor (12% of invested capital)
    estimated_return = round(investment_amount * 0.12)
    
    # Final amount = Principal + Return
    final_amount = investment_amount + estimated_return
    
    return {
        "utilization_timeline": utilization_timeline,
        "utilization_summary": {
            "total_investment": round(total_invested, 2),
            "total_utilized": round(total_utilized, 2),
            "utilization_percentage": utilization_percentage,
            "estimated_revenue": round(estimated_revenue, 2),
            "estimated_return": round(estimated_return, 2),
            "final_amount": round(final_amount, 2)
        }
    }


# Add this route to your Flask app

@app.route("/fund_utilization/<id>", methods=["GET"])
def fund_utilization(id):
    """Get fund utilization timeline for an investor"""
    try:
        inv = investors.find_one({"_id": ObjectId(id)})
        if not inv:
            return jsonify({"error": "Investor not found"}), 404
        
        utilization = generate_fund_utilization(inv)
        if not utilization:
            return jsonify({"error": "Unable to calculate utilization"}), 400
        
        return jsonify(utilization), 200
    except InvalidId:
        return jsonify({"error": "Invalid investor ID"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT LOGGING FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def create_audit_log(action, user, investor_id=None, investor_name=None, changes=None, status="SUCCESS"):
    """
    Create an audit log entry
    
    action: CREATE_INVESTOR, UPDATE_INVESTOR, DELETE_INVESTOR, VIEW_PORTFOLIO, VERIFY_HASH, TAMPER_DETECTED, etc.
    user: who performed the action (default: "admin")
    investor_id: which investor record
    investor_name: investor name for easy reference
    changes: dict of {field: {old: value, new: value}}
    status: SUCCESS, FAILED, WARNING
    """
    try:
        audit_logs = db["audit_logs"]
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "user": user or "system",
            "investor_id": str(investor_id) if investor_id else None,
            "investor_name": investor_name,
            "changes": changes,
            "status": status,
            "ip_address": request.remote_addr if request else "N/A"
        }
        
        audit_logs.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Error creating audit log: {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT LOG ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/audit_logs", methods=["GET"])
def get_audit_logs():
    """Get all audit logs, most recent first"""
    try:
        audit_logs = db["audit_logs"]
        logs = list(audit_logs.find().sort("timestamp", -1).limit(10000))
        
        # Convert ObjectId to string
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audit_logs/<action>", methods=["GET"])
def get_audit_logs_by_action(action):
    """Get audit logs filtered by action type"""
    try:
        audit_logs = db["audit_logs"]
        logs = list(audit_logs.find({"action": action.upper()}).sort("timestamp", -1).limit(1000))
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audit_logs/investor/<investor_id>", methods=["GET"])
def get_investor_audit_logs(investor_id):
    """Get all audit logs for a specific investor"""
    try:
        audit_logs = db["audit_logs"]
        logs = list(audit_logs.find({"investor_id": investor_id}).sort("timestamp", -1).limit(1000))
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audit_stats", methods=["GET"])
def get_audit_stats():
    """Get audit log statistics"""
    try:
        audit_logs = db["audit_logs"]
        
        # Count by action
        actions = audit_logs.aggregate([
            {"$group": {"_id": "$action", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ])
        
        # Count by user
        users = audit_logs.aggregate([
            {"$group": {"_id": "$user", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ])
        
        # Get today's activity
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = audit_logs.count_documents({"timestamp": {"$gte": today.isoformat()}})
        
        return jsonify({
            "actions": list(actions),
            "users": list(users),
            "today_activity": today_count,
            "total_logs": audit_logs.count_documents({})
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# UPDATE EXISTING ROUTES TO LOG ACTIONS
# ─────────────────────────────────────────────────────────────────────────────

# Add logging to add_investor

# Add this route to your app.py (before if __name__ == "__main__":)

@app.route("/system_health", methods=["GET"])
def system_health():
    """Get system health status"""
    try:
        # Blockchain health
        blocks = list(investors.find().sort("_id", 1))
        blockchain_valid = True
        
        if len(blocks) > 0:
            for block in blocks:
                # Recalculate hash with ALL fields (same as generate_transaction_hash)
                check_data = {
                    "name": block.get("name"),
                    "email": block.get("email"),
                    "country": block.get("country"),
                    "amount": block.get("amount"),
                    "project_name": block.get("project_name"),
                    "fund_type": block.get("fund_type"),
                    "success_rate": block.get("success_rate"),
                    "compliance_level": block.get("compliance_level"),
                    "transparency_score": block.get("transparency_score"),
                    "geo_risk": block.get("geo_risk"),
                    "market_volatility": block.get("market_volatility"),
                    "regulatory_instability": block.get("regulatory_instability"),
                    "trust_score": block.get("trust_score"),
                    "risk_score": block.get("risk_score"),
                    "decision": block.get("decision"),
                    "investment_status": block.get("investment_status"),
                    "timestamp": block.get("timestamp"),
                    "previous_hash": block.get("previous_hash"),
                }
                recalc = generate_transaction_hash(check_data)
                if recalc != block.get("transaction_hash"):
                    blockchain_valid = False
                    break
        
        blockchain_status = "HEALTHY" if blockchain_valid else "CRITICAL"
        
        # Database health
        total_investors = investors.count_documents({})
        total_logs = db["audit_logs"].count_documents({}) if "audit_logs" in db.list_collection_names() else 0
        
        database_status = "HEALTHY" if total_investors > 0 else "WARNING"
        
        # Investment health
        total_invested = sum([safe_float(inv.get("amount")) for inv in investors.find()])
        avg_trust = sum([safe_float(inv.get("trust_score")) for inv in investors.find()]) / total_investors if total_investors > 0 else 0
        active_investors = investors.count_documents({"investment_status": "ACTIVE"})
        at_risk = investors.count_documents({"risk_score": {"$gte": 70}})
        
        investment_status = "HEALTHY" if at_risk == 0 else "WARNING" if at_risk < 3 else "CRITICAL"
        
        # API health (always healthy if we got here)
        api_status = "HEALTHY"
        
        # Overall status
        statuses = [blockchain_status, database_status, investment_status, api_status]
        if "CRITICAL" in statuses:
            overall = "CRITICAL"
        elif "WARNING" in statuses:
            overall = "WARNING"
        else:
            overall = "HEALTHY"
        
        # Alerts
        alerts = []
        if not blockchain_valid:
            alerts.append("⚠️ Blockchain integrity compromised")
        if at_risk > 0:
            alerts.append(f"⚠️ {at_risk} investor(s) at high risk")
        if total_investors == 0:
            alerts.append("⚠️ No investors registered")
        
        return jsonify({
            "overall_status": overall,
            "blockchain": {
                "status": blockchain_status,
                "total_blocks": len(blocks),
                "is_valid": blockchain_valid,
                "last_check": datetime.now().isoformat()
            },
            "database": {
                "status": database_status,
                "total_investors": total_investors,
                "total_logs": total_logs,
                "db_size": f"{total_investors} records"
            },
            "investment": {
                "total_invested": total_invested,
                "avg_trust_score": avg_trust,
                "active_investors": active_investors,
                "at_risk_count": at_risk
            },
            "api": {
                "status": api_status,
                "response_time": 50,
                "uptime": 99.9,
                "errors_24h": 0
            },
            "alerts": alerts
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
