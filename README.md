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
