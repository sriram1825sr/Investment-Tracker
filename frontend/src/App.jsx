// App.jsx - Cryptographically Secured Cross-Border Investment & Fund Tracking System
// UPDATED: Added InvestorPortfolio page routing
// Final version: Admin login + World Bank auto geo-risk fetch + all features + Portfolio page

import { useEffect, useState, useRef } from "react";
import GeoRiskMap from "./GeoRiskMap";
import CountryDropdown from "./CountryDropdown";
import InvestorPortfolio from "./InvestorPortfolio";
import SystemHealth from "./SystemHealth";
import AuditLog from "./AuditLog";

const BASE_URL = "https://investment-tracker-3-1tf2.onrender.com";
const ADMIN_CREDENTIALS = { username: "admin", password: "invest@123" };

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [creds, setCreds]     = useState({ username: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (creds.username === ADMIN_CREDENTIALS.username &&
          creds.password === ADMIN_CREDENTIALS.password) {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)",
        borderRadius: "20px", padding: "50px 40px",
        width: "100%", maxWidth: "400px",
        border: "1px solid rgba(0,229,255,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        textAlign: "center", color: "white",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
        <h2 style={{ fontFamily: "Georgia, serif", marginBottom: "6px", color: "#00e5ff" }}>
          Secure Admin Portal
        </h2>
        <p style={{ fontSize: "13px", color: "#546e7a", marginBottom: "30px" }}>
          Cross-Border Investment & Fund Tracking System
        </p>
        <input
          placeholder="Username"
          value={creds.username}
          onChange={(e) => setCreds({ ...creds, username: e.target.value })}
          style={{ ...S.input, width: "100%", marginBottom: "12px", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={creds.password}
          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ ...S.input, width: "100%", marginBottom: "16px", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#ff4d4d", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "12px", borderRadius: "10px", border: "none",
          background: loading ? "#555" : "linear-gradient(90deg, #00b4d8, #0077b6)",
          color: "white", fontWeight: "bold", fontSize: "15px",
          cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Authenticating..." : "Login"}
        </button>
        <p style={{ fontSize: "11px", color: "#37474f", marginTop: "20px" }}>
          Prototype credentials — admin / invest@123
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ onLogout, onViewPortfolio, onViewHealth, onViewAuditLog }) {
  const [investors,   setInvestors]   = useState([]);
  const [systemState, setSystemState] = useState("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId,   setEditingId]   = useState(null);

  // Auto-fetch state
  const [fetchingRisk, setFetchingRisk] = useState(false);
  const [fetchStatus,  setFetchStatus]  = useState(""); // success/error message
  const countryFetchTimer = useRef(null);

  const emptyForm = {
    name: "", email: "", country: "",
    amount: "", project_name: "", fund_type: "",
    success_rate: "", compliance_level: "", transparency_score: "",
    geo_risk: "", market_volatility: "", regulatory_instability: "",
  };
  const [form, setForm] = useState(emptyForm);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchInvestors = async () => {
    try {
      const res = await fetch(`${BASE_URL}/a_investors`);
      setInvestors(await res.json());
    } catch (err) { console.error(err); }
  };

  const validateChain = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/validate_chain`);
      const data = await res.json();
      setSystemState(data.system_state);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchInvestors(); validateChain(); }, []);

  // ── AUTO FETCH COUNTRY RISK ───────────────────────────────────────────────
  // Triggers 800ms after user stops typing in the country field
  const autoFetchCountryRisk = async (countryName) => {
    if (!countryName || countryName.trim().length < 3) return;
    setFetchingRisk(true);
    setFetchStatus("");
    try {
      const res  = await fetch(`${BASE_URL}/country_risk?country=${encodeURIComponent(countryName.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({
          ...prev,
          geo_risk:               String(data.geo_risk),
          market_volatility:      String(data.market_volatility),
          regulatory_instability: String(data.regulatory_instability),
        }));
        setFetchStatus(`success:✅ Risk scores auto-filled from World Bank data`);
      } else {
        setFetchStatus(`error:⚠ ${data.error} — enter scores manually`);
      }
    } catch {
      setFetchStatus("error:❌ Could not reach server — enter scores manually");
    }
    setFetchingRisk(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Debounce country field — fetch after 800ms pause
    if (name === "country") {
      setFetchStatus("");
      clearTimeout(countryFetchTimer.current);
      countryFetchTimer.current = setTimeout(() => {
        autoFetchCountryRisk(value);
      }, 800);
    }
  };

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (systemState === "FROZEN") return;
    const url    = editingId ? `${BASE_URL}/u_investor/${editingId}` : `${BASE_URL}/add_investor`;
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount:                 Number(form.amount)                 || 0,
        success_rate:           Number(form.success_rate)           || 0,
        compliance_level:       Number(form.compliance_level)       || 0,
        transparency_score:     Number(form.transparency_score)     || 0,
        geo_risk:               Number(form.geo_risk)               || 0,
        market_volatility:      Number(form.market_volatility)      || 0,
        regulatory_instability: Number(form.regulatory_instability) || 0,
      }),
    });
    setForm(emptyForm);
    setEditingId(null);
    setFetchStatus("");
    fetchInvestors();
    validateChain();
  };

  const editInvestor = (inv) => {
    setForm({
      name:                     inv.name,
      email:                    inv.email,
      country:                  inv.country,
      amount:                   String(inv.amount),
      project_name:             inv.project_name,
      fund_type:                inv.fund_type,
      success_rate:             String(inv.success_rate),
      compliance_level:         String(inv.compliance_level),
      transparency_score:       String(inv.transparency_score),
      geo_risk:                 String(inv.geo_risk),
      market_volatility:        String(inv.market_volatility),
      regulatory_instability:   String(inv.regulatory_instability),
    });
    setEditingId(inv._id);
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const deleteInvestor = async (id) => {
    if (!confirm("Confirm deletion?")) return;
    await fetch(`${BASE_URL}/d_investor/${id}`, { method: "DELETE" });
    fetchInvestors();
    validateChain();
  };

  const verifyBlockchain = async () => {
    await validateChain();
    alert(systemState === "ACTIVE" ? "✅ Blockchain is valid!" : "⚠ Blockchain integrity compromised!");
  };

  const filteredInvestors = investors.filter(inv =>
    inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.project_name && inv.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const decisionColor = { "APPROVED": "#00ff99", "REJECTED": "#ff4d4d", "REVIEW": "#ffb74d" };
  const statusColor = { "ACTIVE": "#00e5ff", "FROZEN": "#ff4d4d", "LOCKED": "#ff9800", "REDIRECTED": "#ffb74d" };

  return (
    <div style={S.page}>
      {systemState === "FROZEN" && (
        <div style={S.freezeBanner}>
          🔴 SYSTEM FREEZE: Blockchain integrity compromised. All transactions blocked.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", gap: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#00e5ff", fontFamily: "Georgia, serif", flex: 1 }}>
          💼 Investment Dashboard
        </h1>
        <button onClick={() => onViewHealth(true)} style={{
          padding: "10px 20px", borderRadius: "10px", border: "none",
          background: "linear-gradient(90deg, #00d084, #00b870)",
          color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "14px",
          whiteSpace: "nowrap"
        }}>
          💚 System Health
        </button>
        <button onClick={() => onViewAuditLog()} style={{
          padding: "10px 20px", borderRadius: "10px", border: "none",
          background: "linear-gradient(90deg, #7b1fa2, #4a148c)",
          color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "14px",
          whiteSpace: "nowrap"
        }}>
          📋 Audit Log
        </button>
        <button onClick={() => onLogout()} style={{
          padding: "10px 20px", borderRadius: "10px", border: "none",
          background: "linear-gradient(90deg, #ff6b6b, #ee5a52)",
          color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "14px",
          whiteSpace: "nowrap"
        }}>
          🚪 Logout
        </button>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "start", flexWrap: "wrap" }}>
        {/* LEFT: FORM */}
        <div style={S.formBox}>
          <h2 style={{ margin: "0 0 14px", fontSize: "15px", color: "#00e5ff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ➕ Register Investment
          </h2>
          <div style={{ ...S.grid, gridTemplateColumns: "1fr" }}>
            <input placeholder="📛 Name" name="name" value={form.name} onChange={handleChange} style={S.input} />
            <input placeholder="📧 Email" name="email" value={form.email} onChange={handleChange} style={S.input} />
            <CountryDropdown value={form.country} onChange={(c) => handleChange({ target: { name: "country", value: c } })} style={S.input} />
            <input placeholder="💰 Amount ($)" name="amount" value={form.amount} onChange={handleChange} style={S.input} />
            <input placeholder="📁 Project Name" name="project_name" value={form.project_name} onChange={handleChange} style={S.input} />
            <input placeholder="🏦 Fund Type (Equity, Debt, etc)" name="fund_type" value={form.fund_type} onChange={handleChange} style={S.input} />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "14px 0" }} />

          <p style={{ fontSize: "11px", color: "#546e7a", margin: "8px 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            📊 Investor Trust Metrics (0-100)
          </p>
          <div style={S.grid}>
            <input placeholder="Success Rate %" name="success_rate" value={form.success_rate} onChange={handleChange} style={S.input} />
            <input placeholder="Compliance Level %" name="compliance_level" value={form.compliance_level} onChange={handleChange} style={S.input} />
            <input placeholder="Transparency Score %" name="transparency_score" value={form.transparency_score} onChange={handleChange} style={S.input} />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "14px 0" }} />

          <p style={{ fontSize: "11px", color: "#546e7a", margin: "8px 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            🌍 Geo-Political Risk Scores (0-100)
          </p>
          {fetchingRisk && <p style={{ fontSize: "12px", color: "#00e5ff", textAlign: "center", margin: "8px 0" }}>⏳ Fetching risk scores...</p>}
          {fetchStatus && (
            <p style={{
              fontSize: "12px", padding: "8px", borderRadius: "6px", marginBottom: "8px",
              background: fetchStatus.startsWith("success") ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
              color: fetchStatus.startsWith("success") ? "#a5d6a7" : "#ef9a9a",
              border: `1px solid ${fetchStatus.startsWith("success") ? "#66bb6a44" : "#e57373"}`
            }}>
              {fetchStatus.split(":")[1]}
            </p>
          )}
          <div style={S.grid}>
            <input placeholder="Geo Risk (0-100)" name="geo_risk" value={form.geo_risk} onChange={handleChange} style={S.input} disabled={fetchingRisk} />
            <input placeholder="Market Volatility (0-100)" name="market_volatility" value={form.market_volatility} onChange={handleChange} style={S.input} disabled={fetchingRisk} />
            <input placeholder="Regulatory Instability (0-100)" name="regulatory_instability" value={form.regulatory_instability} onChange={handleChange} style={S.input} disabled={fetchingRisk} />
          </div>

          <button onClick={handleSubmit} style={{ ...S.submitBtn, background: editingId ? "linear-gradient(90deg, #f9a825, #f57f17)" : "linear-gradient(90deg, #00d084, #00b870)" }} disabled={systemState === "FROZEN"}>
            {editingId ? "💾 Update" : "✅ Register"}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={{ ...S.submitBtn, marginTop: "8px", background: "linear-gradient(90deg, #666, #555)" }}>
              ❌ Cancel Edit
            </button>
          )}
        </div>

        {/* RIGHT: Cards */}
        <div style={{ flex: "2 1 600px", minWidth: "380px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={verifyBlockchain} style={S.verifyBtn}>
              🔗 Verify Blockchain Integrity
            </button>
            <button
  onClick={async () => {
    await fetch(`${BASE_URL}/reset_chain`, { method: "POST" });
    fetchInvestors();
    validateChain();
  }}
  style={{
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #6a1b9a, #4a148c)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  }}
>
  🔄 Reset System
</button>
<button
  onClick={async () => {
    await fetch(`${BASE_URL}/rebuild_chain`, { method: "POST" });
    fetchInvestors();
    validateChain();
  }}
  style={{
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #ff9800, #f57c00)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  }}
>
  🔧 Rebuild Blockchain
</button>
            <span style={{ fontSize: "12px", color: "#546e7a" }}>
              {investors.length} application{investors.length !== 1 ? "s" : ""} ·{" "}
              <span style={{ color: systemState === "ACTIVE" ? "#00e676" : "#ff4d4d" }}>
                System {systemState}
              </span>
            </span>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {filteredInvestors.length === 0 && (
              <div style={{ color: "#546e7a", textAlign: "center", padding: "40px", fontSize: "14px" }}>
                {investors.length === 0
                  ? "No applications yet. Register the first investor using the form."
                  : "No results match your search."}
              </div>
            )}

            {filteredInvestors.map((inv) => (
              <div key={inv._id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px" }}>{inv.name}</h3>
                    <p style={{ margin: "2px 0", color: "#90a4ae", fontSize: "13px" }}>{inv.email}</p>
                    <p style={{ margin: "2px 0", color: "#80cbc4", fontSize: "13px" }}>📍 {inv.country}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {inv.project_name && (
                      <p style={{ margin: "0 0 2px", color: "#ffd700", fontSize: "13px", fontWeight: "bold" }}>
                        📁 {inv.project_name}
                      </p>
                    )}
                    {inv.fund_type && (
                      <p style={{ margin: "0", color: "#b2ebf2", fontSize: "12px" }}>{inv.fund_type}</p>
                    )}
                    {inv.amount > 0 && (
                      <p style={{ margin: "4px 0 0", color: "#a5d6a7", fontSize: "13px", fontWeight: "bold" }}>
                        💰 ${Number(inv.amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "12px 0" }}>
                  <div style={S.scoreBadge}>
                    <span style={{ color: "#546e7a", fontSize: "11px" }}>TRUST SCORE</span>
                    <span style={{ color: "#00ff99", fontWeight: "bold", fontSize: "18px" }}>{inv.trust_score}</span>
                  </div>
                  <div style={S.scoreBadge}>
                    <span style={{ color: "#546e7a", fontSize: "11px" }}>RISK SCORE</span>
                    <span style={{ color: "#ff4d4d", fontWeight: "bold", fontSize: "18px" }}>{inv.risk_score}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span style={{ ...S.badge, background: (decisionColor[inv.decision] || "#546e7a") + "22", color: decisionColor[inv.decision] || "#fff", border: `1px solid ${(decisionColor[inv.decision] || "#546e7a")}44` }}>
                    {inv.decision}
                  </span>
                  <span style={{ ...S.badge, background: (statusColor[inv.investment_status] || "#546e7a") + "22", color: statusColor[inv.investment_status] || "#fff", border: `1px solid ${(statusColor[inv.investment_status] || "#546e7a")}44` }}>
                    {inv.investment_status}
                  </span>
                </div>

                <p style={{ fontSize: "11px", wordBreak: "break-all", color: "#37474f", margin: "4px 0 10px", fontFamily: "'Courier New', monospace" }}>
                  🔗 {inv.transaction_hash}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => onViewPortfolio(inv._id)}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", border: "none",
                      background: "#0277bd", color: "white", cursor: "pointer",
                      fontWeight: "500", fontSize: "13px"
                    }}
                  >
                    📊 View Portfolio
                  </button>
                  <button
                    onClick={() => editInvestor(inv)}
                    disabled={inv.risk_score >= 70 || systemState === "FROZEN"}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", border: "none",
                      background: inv.risk_score >= 70 || systemState === "FROZEN" ? "#37474f" : "#1565c0",
                      color: inv.risk_score >= 70 || systemState === "FROZEN" ? "#546e7a" : "white",
                      cursor: inv.risk_score >= 70 || systemState === "FROZEN" ? "not-allowed" : "pointer",
                    }}
                  >
                    {inv.risk_score >= 70 ? "🔒 Locked" : "✏ Edit"}
                  </button>
                  <button
                    onClick={() => deleteInvestor(inv._id)}
                    disabled={systemState === "FROZEN"}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", border: "none",
                      background: systemState === "FROZEN" ? "#37474f" : "#b71c1c",
                      color: systemState === "FROZEN" ? "#546e7a" : "white",
                      cursor: systemState === "FROZEN" ? "not-allowed" : "pointer",
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginTop: "30px", marginBottom: "30px" }}>
        <input
          placeholder="🔍 Search by name, email, country or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...S.input, width: "100%", boxSizing: "border-box", padding: "12px" }}
        />
      </div>

      {/* Full width map */}
      <div style={{ marginTop: "40px" }}>
        <GeoRiskMap investors={investors} />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [viewingPortfolioId, setViewingPortfolioId] = useState(null);
  const [viewingSystemHealth, setViewingSystemHealth] = useState(false);
  const [viewingAuditLog, setViewingAuditLog] = useState(false);

  if (viewingAuditLog) {
    return <AuditLog onBack={() => setViewingAuditLog(false)} />;
  }

  if (viewingPortfolioId) {
    return (
      <InvestorPortfolio 
        investorId={viewingPortfolioId} 
        onBack={() => setViewingPortfolioId(null)} 
      />
    );
  }
  if (viewingSystemHealth) {
  return <SystemHealth onBack={() => setViewingSystemHealth(false)} />;
}

if (viewingPortfolioId) {
  return <InvestorPortfolio investorId={viewingPortfolioId} onBack={() => setViewingPortfolioId(null)} />;
}

  return loggedIn
    ? <Dashboard onLogout={() => setLoggedIn(false)} onViewPortfolio={setViewingPortfolioId} onViewHealth={setViewingSystemHealth} onViewAuditLog={() => setViewingAuditLog(true)} />
    : <LoginPage  onLogin={()  => setLoggedIn(true)}  />;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white", padding: "40px", boxSizing: "border-box",
  },
  freezeBanner: {
    background: "linear-gradient(90deg, #b71c1c, #c62828)",
    padding: "14px 20px", borderRadius: "10px",
    marginBottom: "20px", textAlign: "center", fontWeight: "bold",
    border: "1px solid #ef5350",
  },
  formBox: {
    background: "rgba(255,255,255,0.07)", padding: "22px",
    borderRadius: "15px", backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,229,255,0.1)",
  },
  statusBanner: {
    padding: "10px 14px", borderRadius: "8px",
    fontSize: "13px", fontWeight: "500",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  input: {
    padding: "10px 12px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)", outline: "none",
    background: "rgba(255,255,255,0.07)", color: "white", fontSize: "13px",
  },
  submitBtn: {
    gridColumn: "1 / -1", padding: "11px", borderRadius: "10px",
    border: "none", color: "white", fontWeight: "bold", fontSize: "14px",
  },
  verifyBtn: {
    padding: "10px 20px", borderRadius: "10px", border: "none",
    background: "linear-gradient(90deg, #f9a825, #f57f17)",
    fontWeight: "bold", cursor: "pointer", fontSize: "14px",
  },
  card: {
    background: "rgba(255,255,255,0.07)", padding: "20px",
    borderRadius: "15px", backdropFilter: "blur(10px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  scoreBadge: {
    background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "8px 12px",
    display: "flex", flexDirection: "column", gap: "2px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  badge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "bold", letterSpacing: "0.05em",
  },
};
