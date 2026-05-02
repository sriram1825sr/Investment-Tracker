<<<<<<< HEAD
# 💼 Investment Fund Tracking System

A full-stack web application for managing cross-border investments with real-time risk assessment, blockchain-style validation, and comprehensive audit logging.

## 🚀 Live Demo

- **Frontend:** https://investment-fund-app.vercel.app
- **Backend API:** https://investment-fund-app.herokuapp.com
- **API Status:** https://investment-fund-app.herokuapp.com/health

## ✨ Features

### Core Functionality
- ✅ **Secure Admin Authentication** - Login with admin/invest@123
- ✅ **Investor Management** - Create, Read, Update, Delete investor records
- ✅ **Real-time Risk Assessment** - Auto-fill risk scores from World Bank API
- ✅ **Advanced Scoring System**:
  - Trust Score = (success_rate × 40%) + (compliance × 30%) + (transparency × 30%)
  - Risk Score = (geo_risk × 40%) + (volatility × 35%) + (regulatory × 25%)

### Advanced Features
- ✅ **Blockchain-Style Validation** - SHA256 hashing for data integrity
- ✅ **Comprehensive Audit Logging** - Track all changes with timestamp
- ✅ **Investor Portfolio Analytics** - ROI, returns, portfolio metrics
- ✅ **Geographic Risk Mapping** - Visual representation of investments
- ✅ **System Health Monitoring** - Real-time system status
- ✅ **Intelligent Investment Control** - Auto-freeze high-risk investments

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with Hooks
- **Styling:** Modern CSS with Glassmorphic Design
- **Layout:** Responsive Grid System
- **Deployment:** Vercel

### Backend
- **Framework:** Python Flask
- **Database:** MongoDB (Cloud hosted on MongoDB Atlas)
- **External APIs:** World Bank API for risk data
- **Deployment:** Heroku

### Database
- **MongoDB Atlas:** Cloud-hosted MongoDB
- **Collections:** investors, audit_logs
- **Document-based:** Flexible schema for investment data

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- MongoDB 4.4+ (or MongoDB Atlas account)
- Git

### Backend Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd investment-fund-app
```

2. **Create Python virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file with MongoDB connection:**
```bash
cp .env.example .env
# Edit .env and add your MongoDB URI from MongoDB Atlas
MONGO_URI=mongodb+srv://dbuser:password@cluster0.xxxxx.mongodb.net/investment_fund_db?retryWrites=true&w=majority
FLASK_ENV=development
FLASK_DEBUG=False
```

5. **Run backend:**
```bash
python app.py
# Backend runs on http://localhost:5000
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend  # if frontend is in separate folder
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local` file:**
```bash
REACT_APP_API_URL=http://localhost:5000
```

4. **Start development server:**
```bash
npm start
# Frontend opens at http://localhost:3000
```

## 📊 API Endpoints

### Authentication & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check system health status |

### Investor Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/a_investors` | List all investors |
| POST | `/add_investor` | Create new investor |
| PUT | `/u_investor/<id>` | Update investor record |
| DELETE | `/d_investor/<id>` | Delete investor |

### Risk & Validation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/country_risk?country=India` | Fetch risk scores from World Bank |
| GET | `/validate_chain` | Validate blockchain integrity |

### Analytics & Monitoring
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit_logs` | Get all audit logs |
| GET | `/audit_logs/action/<action>` | Filter logs by action (CREATE/UPDATE/DELETE) |
| GET | `/audit_logs/investor/<id>` | Get logs for specific investor |
| GET | `/audit_stats` | Get audit statistics |
| GET | `/system_health` | Comprehensive system health status |

## 🔐 Login Credentials

For demo purposes, use:
```
Username: admin
Password: invest@123
```

**Note:** In production, implement proper authentication with password hashing and JWT tokens.

## 🚀 Deployment

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set FLASK_ENV="production"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variable in Vercel dashboard:
# REACT_APP_API_URL = https://your-heroku-app.herokuapp.com
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://dbuser:password@cluster.mongodb.net/investment_fund_db
FLASK_ENV=development|production
FLASK_DEBUG=False
FRONTEND_URL=http://localhost:3000
JWT_SECRET_KEY=your-secret-key
```

### Frontend (.env.local or .env.production)
```
REACT_APP_API_URL=http://localhost:5000  # local
REACT_APP_API_URL=https://your-api.herokuapp.com  # production
```

## 🔍 Key Features Explained

### Risk Scoring Algorithm

The system uses a weighted multi-factor approach:

**Trust Score (Investor reliability):**
- Success Rate: 40% weight
- Compliance Level: 30% weight
- Transparency Score: 30% weight

**Risk Score (Investment risk):**
- Geopolitical Risk: 40% weight
- Market Volatility: 35% weight
- Regulatory Instability: 25% weight

**Investment Decision:**
- APPROVED: Trust > 70 AND Risk < 40
- REJECTED: Risk > 70
- REVIEW: Everything else

**Investment Status:**
- ACTIVE: Normal operation
- FROZEN: Risk 70-80 (high risk)
- LOCKED: Risk ≥ 80 (critical risk)
- REDIRECTED: Trust < 40 (low trust)

### Blockchain-Style Validation

Each investor record is hashed using SHA256, including:
- Investor data (name, email, country, amount)
- Calculated scores (trust, risk)
- Investment decision and status
- Timestamp and previous hash

This creates an audit trail where any tampering is detected by:
```bash
GET /validate_chain
```

### World Bank API Integration

The system fetches real geopolitical risk data from World Bank:
- Automatically populates risk scores when investor's country is entered
- Uses `PV.PER.RNK` indicator (Political Stability Rank)
- Falls back to predefined database of 50+ countries if API is unavailable
- Timeout: 3 seconds with graceful degradation

### Audit Logging

All actions are logged:
- **CREATE:** New investor added
- **UPDATE:** Investor record modified
- **DELETE:** Investor record removed
- **View logs:** `/audit_logs`
- **Statistics:** `/audit_stats`

## 🔒 Security Features

Implemented:
- ✅ Form validation on frontend and backend
- ✅ Input sanitization (HTML escape)
- ✅ Error handling with generic messages
- ✅ Audit logging for compliance
- ✅ Blockchain validation for tampering detection
- ✅ Environment variables for secrets
- ✅ System freeze for high-risk investments

Not yet implemented (roadmap):
- [ ] JWT authentication tokens
- [ ] Password hashing (bcrypt/argon2)
- [ ] Rate limiting per IP
- [ ] HTTPS enforcement
- [ ] Database encryption at rest
- [ ] Two-factor authentication

## 📈 How to Use

### Adding an Investor

1. Login with admin/invest@123
2. Fill in investor details:
   - Full Name (required)
   - Email (required)
   - Country (required - auto-fills risk scores!)
   - Investment Amount
   - Project details
   - Success Rate, Compliance Level, Transparency Score (0-100)
3. Click "Add Investor"
4. System calculates Trust and Risk scores automatically
5. Record is added to blockchain and audit log

### Editing an Investor

1. Click ✏️ Edit button on investor card
2. Modify details
3. Click 💾 Update Investor
4. Changes are recorded in audit log

### Deleting an Investor

1. Click 🗑️ Delete button
2. Confirm deletion
3. Investor removed from system
4. Deletion logged in audit trail

### Viewing Portfolio

1. Click 📊 Portfolio button on investor card
2. See detailed metrics:
   - Investment amount and days invested
   - Annual return projection
   - ROI percentage
   - Portfolio growth
   - Compliance score

### Monitoring System Health

1. Click 🏥 System Health button
2. View:
   - Overall system status
   - Blockchain integrity
   - Database health
   - Investment analytics
   - System alerts

### Audit Trail

1. Click 📋 Audit Log button
2. View all actions with:
   - Action type (CREATE/UPDATE/DELETE)
   - Investor name
   - Timestamp
   - User who performed action

## 🧪 Testing

### Manual Testing Checklist

```
Frontend:
- [ ] Login page loads
- [ ] Login works with correct credentials
- [ ] Dashboard displays
- [ ] Add investor form works
- [ ] Risk scores auto-fill (when entering country)
- [ ] Can add investor successfully
- [ ] Can edit investor
- [ ] Can delete investor (with confirmation)
- [ ] Search works
- [ ] Portfolio view displays
- [ ] System health shows
- [ ] Audit logs display
- [ ] No console errors

Backend:
- [ ] Health endpoint responds
- [ ] Can get all investors
- [ ] Can add investor
- [ ] Can update investor
- [ ] Can delete investor
- [ ] Country risk endpoint works
- [ ] Blockchain validation works
- [ ] Audit logs recorded
- [ ] All endpoints return proper HTTP codes
```

### API Testing with cURL

```bash
# Test health
curl http://localhost:5000/health

# Get investors
curl http://localhost:5000/a_investors

# Get country risk
curl "http://localhost:5000/country_risk?country=India"

# Validate blockchain
curl http://localhost:5000/validate_chain

# Get system health
curl http://localhost:5000/system_health
```

## 📚 Project Structure

```
investment-fund-app/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile            # Heroku configuration
│   ├── runtime.txt         # Python version
│   ├── .env.example        # Environment template
│   ├── .env                # Environment variables (DON'T COMMIT)
│   └── .gitignore          # Git ignore rules
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── components/     # React components
│   │   └── index.js        # Entry point
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   ├── .env.local          # Local development
│   └── .env.production     # Production config
│
├── README.md               # This file
└── DEPLOYMENT_GUIDE.md     # Deployment instructions
```

## 🐛 Troubleshooting

### "Cannot GET /a_investors"
- Backend not running
- Frontend and backend on different domains (check CORS)
- API URL incorrectly configured

### "MongoDB connection failed"
- MongoDB Atlas cluster not running
- Connection string incorrect
- IP not whitelisted in MongoDB Atlas

### "CORS error"
- Backend CORS not configured for frontend domain
- Check `CORS` configuration in app.py

### Frontend shows blank page
- Check React app compiled correctly
- Check API_URL environment variable
- Check browser console for errors (F12)

### Login doesn't work
- Check credentials are correct (admin/invest@123)
- Check backend is running
- Check no API errors in backend logs

## 📞 Support & Contact

- **GitHub:** [Your GitHub URL]
- **Email:** your.email@example.com
- **Phone:** Your Phone Number

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Flask framework for Python backend
- React for frontend framework
- MongoDB for database
- World Bank API for risk data
- Vercel for frontend hosting
- Heroku for backend hosting

## 🎯 Future Enhancements

1. **Authentication:**
   - JWT tokens
   - User registration
   - Password reset
   - Multi-user support

2. **Features:**
   - Payment integration
   - Real-time notifications
   - Email alerts
   - Advanced reporting
   - Machine learning predictions

3. **Security:**
   - API rate limiting
   - Two-factor authentication
   - Data encryption
   - Advanced logging

4. **Performance:**
   - Database indexing
   - Caching layer
   - Load balancing
   - CDN integration

---

**Last Updated:** May 2026  
**Status:** Production Ready ✅  
**Maintainer:** Your Name

=======
# Cryptographically Secured Cross-Border Investment & Fund Tracking System

A full-stack web application that manages cross-border investments using SHA-256 blockchain technology, autonomous risk assessment, and real-time World Bank geopolitical data integration.

[![GitHub](https://img.shields.io/badge/GitHub-sriram1825sr-black?style=flat&logo=github)](https://github.com/sriram1825sr/Investment-Tracker)
![React](https://img.shields.io/badge/React-19-blue?style=flat)
![Flask](https://img.shields.io/badge/Flask-Python-green?style=flat)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-darkgreen?style=flat)
![SHA-256](https://img.shields.io/badge/Blockchain-SHA--256-orange?style=flat)

---

## Problem Statement

Cross-border investment systems face three critical problems:

- **Tamper Risk** — Investment records stored in regular databases can be silently modified by insiders or attackers with no way to detect it
- **Manual Risk Assessment** — Geo-political risk is assessed manually using outdated reports with no real-time data
- **Zero Transparency** — Investors have no visibility into how their capital is being used or whether their records are intact

This system solves all three using cryptographic blockchain, live World Bank API data, and an autonomous decision engine.

---

## Features

### Admin Portal
- Secure login with credential authentication
- Full investor registration and management
- Real-time investor search and filtering
- Edit and delete investor records
- Blockchain integrity verification
- System reset and chain rebuild

### Investor Portal
- Self-registration with email and password
- Investment application form
- Autonomous approval decision — no manual review needed
- Clean read-only portfolio view after approval
- Returns chart, fund utilization breakdown, investment status

### Blockchain Security
- SHA-256 hash chain — every investor record is a cryptographic block
- Any field change instantly detected — system freezes all transactions
- Chain rebuild recovery for admin
- Per-investor hash verification

### Autonomous Decision Engine
- World Bank API fetches live geo-political risk scores per country
- Trust Score = Success Rate (40%) + Compliance Level (30%) + Transparency Score (30%)
- Risk Score = Geo Risk (40%) + Market Volatility (35%) + Regulatory Instability (25%)
- APPROVED — Trust > 70 and Risk < 40
- REVIEW — All other combinations
- REJECTED — Risk >= 70

### Portfolio Analytics
- Overview tab — investment details and projected ROI
- Returns tab — line chart of portfolio growth over time
- Fund Utilization tab — capital allocation pie chart and stage breakdown

### GeoRisk Map
- Interactive world map with all investors plotted
- Colour-coded risk levels per country
- Click investor markers for details

### Audit Log
- Every system action logged — user, IP address, timestamp, changes
- Filter by action type and date range
- Stats strip showing total, successful, failed, and today's activity

### System Health Monitor
- Real-time 4-panel status — Blockchain, Database, Investments, API
- Auto-refreshes every 10 seconds
- Alerts surface automatically when issues are detected

### Blockchain Visualizer
- Animated live chain visualization
- Blocks appear with entrance animations
- Tamper detection turns chain red instantly
- Click any block to inspect its hash details

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | UI, routing, state management |
| Backend | Flask (Python) | REST API, blockchain engine, business logic |
| Database | MongoDB (Local) | investors, audit_logs, investor_accounts |
| Security | SHA-256 Hash Chain | Tamper-proof cryptographic blockchain |
| Charts | Recharts | Portfolio analytics visualizations |
| Map | React Simple Maps | Geographic risk visualization |
| Data API | World Bank API | Live geo-political risk scores |

---

## Project Structure

```
Investment-Tracker/
├── backend/
│   ├── app.py                  # Flask backend — all routes and blockchain logic
│   └── seed_demo_data.py       # Demo data loader for testing
├── frontend/
│   └── src/
│       ├── App.jsx             # Main component — routing and login
│       ├── InvestorPortfolio.jsx   # Admin portfolio view (5 tabs)
│       ├── InvestorPanel.jsx   # Investor portal
│       ├── SystemHealth.jsx    # Health monitor
│       ├── AuditLog.jsx        # Audit log viewer
│       ├── BlockchainVisualizer.jsx  # Animated chain
│       ├── GeoRiskMap.jsx      # World map visualization
│       └── CountryDropdown.jsx # Country selector
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- MongoDB (running locally)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/sriram1825sr/Investment-Tracker.git
cd Investment-Tracker
```

**2. Install backend dependencies**
```bash
cd backend
pip install flask flask-cors pymongo requests
```

**3. Install frontend dependencies**
```bash
cd frontend
npm install
```

**4. Start MongoDB**
```bash
mongod
```

**5. Start the backend**
```bash
cd backend
python app.py
```

**6. Start the frontend**
```bash
cd frontend
npm run dev
```

**7. Load demo data (optional)**
```bash
cd backend
python seed_demo_data.py
```

**8. Open the application**
```
http://localhost:5173
```

---

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | invest@123 |
| Investor | Register via the Investor login page | Your chosen password |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/login | Unified login for admin and investor |
| POST | /investor/signup | Investor self-registration |
| POST | /investor/submit_form | Submit investment application |
| GET | /investor/status/:email | Check investor application status |
| GET | /a_investors | Get all investors (admin) |
| POST | /add_investor | Register new investor (admin) |
| PUT | /u_investor/:id | Update investor record |
| DELETE | /d_investor/:id | Delete investor record |
| GET | /validate_chain | Verify blockchain integrity |
| POST | /rebuild_chain | Rebuild hash chain |
| POST | /reset_chain | Reset entire system |
| GET | /portfolio_metrics/:id | Get portfolio analytics |
| GET | /monthly_returns/:id | Get monthly return data |
| GET | /fund_utilization/:id | Get fund utilization breakdown |
| GET | /audit_logs | Get all audit logs |
| GET | /audit_stats | Get audit log statistics |
| GET | /system_health | Get system health status |
| GET | /country_risk | Get country risk scores from World Bank |

---

## Database Collections

| Collection | Purpose |
|---|---|
| investors | All investor records with blockchain hashes |
| audit_logs | Complete system action trail |
| investor_accounts | Investor login credentials |

---

## Demo Investors

The seed script loads 8 investors covering every possible status:

| Investor | Country | Decision | Status |
|---|---|---|---|
| Sophia Chen | Singapore | APPROVED | ACTIVE |
| James Okafor | UK | APPROVED | ACTIVE |
| Klaus Muller | Germany | APPROVED | ACTIVE |
| Yuki Tanaka | Japan | APPROVED | ACTIVE |
| Priya Sharma | India | REVIEW | ACTIVE |
| Carlos Mendes | Brazil | REVIEW | ACTIVE |
| Arash Tehrani | Iran | REJECTED | FROZEN |
| Omar Al-Rashid | Syria | REJECTED | LOCKED |

---

## Security

- SHA-256 cryptographic hash chain for tamper detection
- System freezes all transactions when blockchain integrity is compromised
- All passwords hashed before storage
- Complete audit trail with IP address tracking
- Investor data fields stripped of sensitive information in investor portal
- CORS configured for local development

---

## License

This project was developed as a final year academic project.

---

## Author

**Sriram** — [github.com/sriram1825sr](https://github.com/sriram1825sr)
>>>>>>> dba19e6686f049cd3910a01077b4f14d61b91d44
