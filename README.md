# Cryptographically Secured Cross-Border Investment & Fund Tracking System

A full-stack web application for managing cross-border investments with real-time risk assessment, blockchain-style validation using SHA-256 hashing, and comprehensive audit logging. Built with React, Flask, and MongoDB.

---

## Key Features

### Admin Dashboard
- ✅ **Secure Admin Authentication** — Login with provided credentials
- ✅ **Investor Management** — Create, Read, Update, Delete investor records with full audit trail
- ✅ **Real-time Risk Assessment** — Auto-fill risk scores from World Bank API (with fallback database for 50+ countries)
- ✅ **Intelligent Scoring System**:
  - **Trust Score** = (success_rate × 40%) + (compliance_level × 30%) + (transparency_score × 30%)
  - **Risk Score** = (geo_risk × 40%) + (market_volatility × 35%) + (regulatory_instability × 25%)

### Advanced Features
- ✅ **Blockchain-Style Validation** — SHA-256 hashing for tamper detection on every record
- ✅ **Autonomous Investment Control** — System auto-freezes high-risk investments (risk ≥ 70)
- ✅ **Comprehensive Audit Logging** — Track all changes with user, timestamp, and action type
- ✅ **Investor Portfolio Analytics** — ROI calculations, projected returns, portfolio metrics
- ✅ **Geographic Risk Mapping** — Visual world map of investments by risk level
- ✅ **System Health Monitoring** — Real-time blockchain, database, investment, and API health status
- ✅ **Chain Rebuild Recovery** — Restore blockchain integrity if needed

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Hooks | UI, routing, state management |
| **Styling** | CSS (Glassmorphism Design) | Modern responsive design |
| **Backend** | Python Flask + CORS | REST API, blockchain engine, business logic |
| **Database** | MongoDB (Cloud - Atlas) | investors, audit_logs collections |
| **Security** | SHA-256 Hash Chain | Cryptographic blockchain validation |
| **External API** | World Bank API | Live geo-political risk data |
| **Deployment** | Vercel (Frontend), Render (Backend) | Production hosting |

---

##  Live Demo

- **Frontend:** https://investment-fund-app.vercel.app
- **Backend API:** https://investment-tracker-3-1tf2.onrender.com
- **API Status:** https://investment-tracker-3-1tf2.onrender.com/system_health

### Login Credentials
```
Username: admin
Password: invest@123
```

---

##  Core Algorithms Explained

### Investment Decision Engine
```
APPROVED   → Trust Score > 70 AND Risk Score < 40
REJECTED   → Risk Score > 70
REVIEW     → All other cases
```

### Investment Status Control
```
ACTIVE     → Normal operation (no automatic restrictions)
FROZEN     → Risk Score between 70-80 (high risk - operations may be restricted)
LOCKED     → Risk Score ≥ 80 (critical risk - locked from editing)
REDIRECTED → Trust Score < 40 (low trust investor)
```

### Risk Score Calculation (Weighted)
- **Geopolitical Risk:** 40% (from World Bank API or fallback database)
- **Market Volatility:** 35% (country-based economic instability)
- **Regulatory Instability:** 25% (governance risk)

### Trust Score Calculation (Weighted)
- **Success Rate:** 40% (investor's historical success percentage)
- **Compliance Level:** 30% (regulatory compliance score)
- **Transparency Score:** 30% (data availability and clarity)

---

## Blockchain-Style Validation

Each investor record is cryptographically hashed using SHA-256, including:
- Investor data (name, email, country, amount, project details)
- Calculated scores (trust_score, risk_score)
- Investment decision and status
- Timestamp and previous block hash (creating a chain)

**How Tampering is Detected:**
- Any modification to a record changes its hash
- The chain's `previous_hash` references would become invalid
- System detects this and freezes all operations
- **Verification endpoint:** `GET /validate_chain`

---

##  Project Structure

```
investment-tracker/
├── frontend/
│   ├── App.jsx                      # Main component - routing, login, dashboard
│   ├── GeoRiskMap.jsx              # World map visualization
│   ├── CountryDropdown.jsx         # Country selector with risk fetching
│   ├── InvestorPortfolio.jsx       # Portfolio analytics view
│   ├── SystemHealth.jsx            # System health monitor
│   ├── AuditLog.jsx                # Audit trail viewer
│   └── index.css                   # Global styles
│
├── backend/
│   └── app.py                       # Flask backend - all routes, blockchain logic
│
└── README.md
```

---

##  API Endpoints Reference

### Investor Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/a_investors` | List all investors |
| POST | `/add_investor` | Create new investor (requires full data) |
| PUT | `/u_investor/<id>` | Update investor record by ID |
| DELETE | `/d_investor/<id>` | Delete investor by ID |

### Risk & World Bank Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/country_risk?country=India` | Fetch risk scores from World Bank API |

### Blockchain & Validation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/validate_chain` | Validate entire blockchain integrity |
| GET | `/verify_hash/<id>` | Verify single investor record hash |
| POST | `/rebuild_chain` | Rebuild blockchain chain (recovery) |

### Portfolio & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolio_metrics/<id>` | Get investor portfolio metrics (ROI, projections) |

### Audit & Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit_logs` | Get all audit logs (last 1000) |
| GET | `/audit_logs/action/<action>` | Filter logs by action (ADD_INVESTOR, UPDATE_INVESTOR, DELETE_INVESTOR) |
| GET | `/audit_logs/investor/<id>` | Get audit history for specific investor |
| GET | `/audit_stats` | Get audit statistics (actions by type, users, today's activity) |
| GET | `/system_health` | Comprehensive system status report |

---

##  Adding an Investor (Request Body Example)

```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "country": "India",
  "amount": 500000,
  "project_name": "Tech Startup Series A",
  "fund_type": "Venture Capital",
  "success_rate": 85,
  "compliance_level": 90,
  "transparency_score": 88,
  "geo_risk": 38,
  "market_volatility": 35,
  "regulatory_instability": 40
}
```

**What Happens Next:**
1. System calculates Trust Score and Risk Score
2. Investment decision is made (APPROVED/REJECTED/REVIEW)
3. Investment status is set (ACTIVE/FROZEN/LOCKED/REDIRECTED)
4. SHA-256 hash is generated
5. Record is stored with previous hash (creating blockchain link)
6. Audit log entry is created

---

##  World Bank API Integration

The system automatically fetches real-time geo-political risk data:

**How it works:**
1. User enters an investor's country (e.g., "India")
2. System queries World Bank API with `PV.PER.RNK` indicator (Political Stability Rank)
3. If API call succeeds → Risk scores auto-populate
4. If API fails or country not found → Falls back to predefined database of 50+ countries
5. User can override values if needed

**Supported Countries in Fallback Database:**
High-risk: Syria, Yemen, Somalia, North Korea, Libya, Afghanistan, Sudan, DR Congo, etc.
Stable: Switzerland, Norway, Denmark, Finland, Japan, Germany, Canada, etc.
Emerging: India, Brazil, Turkey, Russia, Pakistan, Nigeria, etc.

**Timeout:** 3 seconds per API call (graceful degradation if slow)

---

##  Dashboard Features

### Form Input Fields
- **Investor Details:** name, email, country
- **Investment Details:** amount, project_name, fund_type
- **Success Metrics:** success_rate (0-100), compliance_level (0-100), transparency_score (0-100)
- **Risk Factors:** geo_risk, market_volatility, regulatory_instability (0-100 each)

### Dynamic Behaviors
- ✅ Editing disabled if Risk Score ≥ 70 (LOCKED status)
- ✅ Deletion disabled if system is FROZEN (blockchain compromised)
- ✅ Country field triggers auto-fetch of risk scores (800ms debounce)
- ✅ Search filters investors by name, email, country, or project_name
- ✅ Cards color-coded by decision (APPROVED=green, REJECTED=red, REVIEW=orange)

### System Freeze Banner
- Red warning banner appears if blockchain integrity is compromised
- All transactions blocked until admin runs `/rebuild_chain`
- Prevents further tampering

---

##  Security Features

Implemented:
- ✅ **Form Validation** — Frontend and backend input validation
- ✅ **Input Sanitization** — HTML escaping for all text inputs
- ✅ **Error Handling** — Generic error messages to prevent info leakage
- ✅ **Audit Logging** — Complete trail of all actions (CREATE, UPDATE, DELETE)
- ✅ **Blockchain Validation** — Tamper detection through hash chain
- ✅ **CORS Enabled** — Secure cross-origin requests
- ✅ **System Freeze Mechanism** — Auto-disable transactions on tamper detection
- ✅ **Risk-Based Access Control** — Edit/delete restrictions based on risk level

**Not Implemented (Production TODO):**
- ⚠️ Password hashing (currently plain text for demo)
- ⚠️ JWT authentication (currently hardcoded credentials)
- ⚠️ HTTPS enforcement
- ⚠️ Rate limiting on API endpoints
- ⚠️ Two-factor authentication

---

##  Installation & Deployment

### Local Development

**Prerequisites:**
- Python 3.8+
- Node.js 14+
- Git

**Backend Setup:**
```bash
# Clone repository
git clone <your-repo-url>
cd investment-tracker

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors pymongo requests

# Run backend
python app.py
# Backend available at http://localhost:5000
```

**Frontend Setup:**
```bash
# Open new terminal
cd investment-tracker

# Install dependencies
npm install

# Start development server
npm start
# Frontend available at http://localhost:3000

# Or if using Vite:
npm run dev
# Frontend available at http://localhost:5173
```

---

### Deployment to Vercel (Frontend) & Render (Backend)

**Backend Deployment to Render:**

1. Push code to GitHub repository
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repository
5. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
6. Deploy (Render auto-deploys on git push)
7. Note the deployed URL (e.g., `https://your-app.onrender.com`)

**Frontend Deployment to Vercel:**

1. Go to https://vercel.com
2. Import GitHub repository
3. Set Environment Variables:
   - `REACT_APP_API_URL`: Your Render backend URL
4. Deploy (Vercel auto-deploys on git push)
5. Get your live frontend URL

---

##  Testing the System

### Test Scenario: Add & Delete Investor

```bash
# 1. Add a new investor via UI or API
curl -X POST https://your-api.onrender.com/add_investor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Investor",
    "email": "test@example.com",
    "country": "India",
    "amount": 100000,
    "project_name": "Test Project",
    "fund_type": "Seed",
    "success_rate": 75,
    "compliance_level": 80,
    "transparency_score": 85,
    "geo_risk": 38,
    "market_volatility": 35,
    "regulatory_instability": 40
  }'

# 2. Verify blockchain is valid
curl https://your-api.onrender.com/validate_chain
# Expected: {"status": "CHAIN_VALID", "system_state": "ACTIVE"}

# 3. Delete the investor (replace ID from step 1)
curl -X DELETE https://your-api.onrender.com/d_investor/<investor_id>

# 4. Verify blockchain is STILL valid (chain rebuild happened)
curl https://your-api.onrender.com/validate_chain
# Expected: {"status": "CHAIN_VALID", "system_state": "ACTIVE"}
```

---

##  Database Schema

### Investors Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "country": String,
  "amount": Number,
  "project_name": String,
  "fund_type": String,
  "success_rate": Number,
  "compliance_level": Number,
  "transparency_score": Number,
  "geo_risk": Number,
  "market_volatility": Number,
  "regulatory_instability": Number,
  "trust_score": Number,
  "risk_score": Number,
  "decision": String (APPROVED/REJECTED/REVIEW),
  "investment_status": String (ACTIVE/FROZEN/LOCKED/REDIRECTED),
  "timestamp": ISO String,
  "previous_hash": String,
  "transaction_hash": String (SHA-256)
}
```

### Audit Logs Collection
```json
{
  "_id": ObjectId,
  "action": String (ADD_INVESTOR/UPDATE_INVESTOR/DELETE_INVESTOR),
  "user": String,
  "investor_id": String,
  "investor_name": String,
  "changes": Object,
  "status": String (SUCCESS/FAILED),
  "timestamp": ISO String
}
```

---

##  Known Issues & Fixes

### Issue: System Freezes on Investor Deletion
**Cause:** Blockchain chain breaks because deleted investor's hash is referenced by remaining investors  
**Fix:** Chain rebuild function automatically restores chain integrity after deletion  
**Status:** Fixed in latest version

### Issue: World Bank API Timeout
**Cause:** API slow or unreachable  
**Fix:** Falls back to predefined database of 50+ countries automatically  
**Status:**  Handled gracefully

---

##  Performance Considerations

- **Database:** Indexed on `_id` and `timestamp` for fast queries
- **API Calls:** World Bank API call has 3-second timeout with fallback
- **Frontend:** React hooks for efficient re-rendering
- **Blockchain:** O(n) validation time (acceptable for < 10,000 records)

---

##  Contributing

This is a demonstration/educational project. Feel free to fork and extend with:
- User authentication with JWT
- Password hashing (bcrypt)
- Advanced analytics dashboard
- Real-time notifications
- Mobile app support
- Multi-currency support
- Advanced reporting

---

##  License

Educational & Demonstration Project

---

##  Support

For issues or questions:
1. Check the API endpoint documentation above
2. Review audit logs via `/audit_logs` endpoint
3. Check system health via `/system_health` endpoint
4. Verify blockchain integrity via `/validate_chain` endpoint

---

**Last Updated:** May 2026  
**Status:** Production Ready 
**Version:** 1.0
