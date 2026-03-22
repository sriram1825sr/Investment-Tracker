// InvestorPanel.jsx — Investor Portal
// Screens: form → pending/rejected → approved portfolio (no hash/score data)
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './InvestorPanel.css';

const BASE_URL = 'http://localhost:5000';
const COLORS   = ['#00b4d8', '#00e676', '#f4a261', '#e63946', '#9c88ff'];

export default function InvestorPanel({ session, onLogout, onSessionUpdate }) {
  const { name, email, account_status, investor_id, investor_data } = session;

  const initialScreen =
    !investor_id                  ? 'form'      :
    account_status === 'approved' ? 'portfolio' :
    account_status === 'rejected' ? 'rejected'  : 'pending';

  const [screen,      setScreen]      = useState(initialScreen);
  const [form,        setForm]        = useState({ name, email, country: '', amount: '', project_name: '', fund_type: '' });
  const [formErr,     setFormErr]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [profile,     setProfile]     = useState(investor_data || null);
  const [metrics,     setMetrics]     = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [loadingData, setLoadingData] = useState(false);

  // Poll status every 5s while pending
  useEffect(() => {
    if (screen !== 'pending') return;
    const id = setInterval(pollStatus, 5000);
    return () => clearInterval(id);
  }, [screen]);

  // Fetch portfolio data once approved
  useEffect(() => {
    if (screen === 'portfolio' && investor_id && !metrics) {
      fetchPortfolioData(investor_id);
    }
  }, [screen, investor_id]);

  const pollStatus = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/investor/status/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.account_status === 'approved') {
        onSessionUpdate({ account_status: 'approved', investor_id: data.investor_id, investor_data: data.investor_data });
        setProfile(data.investor_data);
        setScreen('portfolio');
      } else if (data.account_status === 'rejected') {
        onSessionUpdate({ account_status: 'rejected' });
        setScreen('rejected');
      }
    } catch {}
  };

  const fetchPortfolioData = async (id) => {
    setLoadingData(true);
    try {
      const [m, mo, u] = await Promise.all([
        fetch(`${BASE_URL}/portfolio_metrics/${id}`),
        fetch(`${BASE_URL}/monthly_returns/${id}`),
        fetch(`${BASE_URL}/fund_utilization/${id}`),
      ]);
      if (m.ok)  setMetrics(await m.json());
      if (mo.ok) setMonthlyData(await mo.json());
      if (u.ok)  setUtilization(await u.json());
    } catch {}
    setLoadingData(false);
  };

  const handleSubmitForm = async () => {
    setFormErr('');
    const { country, amount, project_name, fund_type } = form;
    if (!country || !amount || !project_name || !fund_type) { setFormErr('All fields are required'); return; }
    if (isNaN(Number(amount)) || Number(amount) <= 0)       { setFormErr('Amount must be a valid positive number'); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`${BASE_URL}/investor/submit_form`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) { setFormErr(data.error || 'Submission failed'); }
      else {
        onSessionUpdate({ account_status: data.status, investor_id: data.investor_id });
        setScreen(data.status === 'approved' ? 'portfolio' : data.status === 'rejected' ? 'rejected' : 'pending');
      }
    } catch { setFormErr('Cannot connect to server.'); }
    setSubmitting(false);
  };

  const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;
  const pct = (n) => `${Number(n || 0).toFixed(1)}%`;
  const statusColor   = { ACTIVE: '#00e5ff', FROZEN: '#e63946', LOCKED: '#f4a261', REDIRECTED: '#ffb74d' };
  const decisionColor = { APPROVED: '#00e676', REJECTED: '#e63946', REVIEW: '#f4a261' };

  // Shared header
  const Header = () => (
    <div className="ip-header">
      <div>
        <h1>💼 Investor Portal</h1>
        <p className="ip-subtitle">Welcome, <strong>{name}</strong> · <span style={{color:'#546e7a'}}>{email}</span></p>
      </div>
      <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
        <span className="ip-readonly-badge">🔒 Read Only</span>
        <button onClick={onLogout} className="ip-btn-logout">🚪 Logout</button>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: FORM
  // ════════════════════════════════════════════════════════════
  if (screen === 'form') return (
    <div className="ip-container">
      <Header />
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <div className="ip-card">
          <div className="ip-card-title">📋 Investment Application</div>
          <p style={{ color:'#78909c', fontSize:'13px', marginBottom:'20px', marginTop:'-6px' }}>
            Fill in your details. Our system will process your application instantly.
          </p>

          {/* Name & Email — prefilled, locked */}
          {[
            { label:'📛 Full Name', key:'name',  type:'text',  disabled:true },
            { label:'📧 Email',     key:'email', type:'email', disabled:true },
          ].map(({ label, key, type, disabled }) => (
            <div key={key} style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'11px', color:'#546e7a', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
              <input type={type} value={form[key]} disabled={disabled}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.03)', color:'#546e7a', fontSize:'13px', outline:'none' }} />
            </div>
          ))}

          {/* Editable fields */}
          {[
            { label:'🌍 Country',             key:'country',      type:'text',   placeholder:'e.g. Germany, India, USA' },
            { label:'💰 Investment Amount ($)', key:'amount',      type:'number', placeholder:'e.g. 500000' },
            { label:'📁 Project Name',         key:'project_name',type:'text',   placeholder:'Your project name' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'11px', color:'#546e7a', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:'13px', outline:'none' }} />
            </div>
          ))}

          {/* Fund type */}
          <div style={{ marginBottom:'20px' }}>
            <label style={{ display:'block', fontSize:'11px', color:'#546e7a', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>🏦 Fund Type</label>
            <select value={form.fund_type} onChange={e => setForm({ ...form, fund_type: e.target.value })}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(30,40,50,0.9)', color:'white', fontSize:'13px', outline:'none' }}>
              <option value="">Select fund type...</option>
              {['Equity','Debt','Hybrid','Grant','Venture Capital','Private Equity'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {formErr && (
            <div style={{ background:'rgba(230,57,70,0.1)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:'8px', padding:'10px 14px', color:'#ef9a9a', fontSize:'13px', marginBottom:'14px' }}>
              ❌ {formErr}
            </div>
          )}

          <button onClick={handleSubmitForm} disabled={submitting} style={{
            width:'100%', padding:'12px', borderRadius:'10px', border:'none',
            background: submitting ? '#555' : 'linear-gradient(90deg,#00c897,#00a878)',
            color:'white', fontWeight:'bold', fontSize:'15px', cursor: submitting ? 'not-allowed' : 'pointer',
          }}>
            {submitting ? '⏳ Processing...' : '🚀 Submit Application'}
          </button>
          <p style={{ fontSize:'11px', color:'#37474f', marginTop:'12px', textAlign:'center' }}>
            Applications are processed instantly by our autonomous decision engine.
          </p>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: PENDING
  // ════════════════════════════════════════════════════════════
  if (screen === 'pending') return (
    <div className="ip-container">
      <Header />
      <div style={{ maxWidth:'480px', margin:'40px auto', textAlign:'center' }}>
        <div className="ip-card" style={{ padding:'50px 30px' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>⏳</div>
          <h2 style={{ color:'#f4a261', marginBottom:'10px' }}>Application Under Review</h2>
          <p style={{ color:'#78909c', fontSize:'14px', lineHeight:'1.6', marginBottom:'20px' }}>
            Your application has been submitted and is being assessed by our risk engine. This usually resolves in moments.
          </p>
          <div style={{ background:'rgba(244,162,97,0.08)', border:'1px solid rgba(244,162,97,0.25)', borderRadius:'10px', padding:'12px', marginBottom:'20px' }}>
            <p style={{ color:'#f4a261', margin:0, fontSize:'13px' }}>🔄 Auto-checking every 5 seconds...</p>
          </div>
          <button onClick={pollStatus} style={{
            padding:'10px 24px', borderRadius:'8px', border:'none',
            background:'linear-gradient(90deg,#00b4d8,#0077b6)',
            color:'white', fontWeight:'bold', cursor:'pointer', fontSize:'13px',
          }}>🔍 Check Now</button>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: REJECTED
  // ════════════════════════════════════════════════════════════
  if (screen === 'rejected') return (
    <div className="ip-container">
      <Header />
      <div style={{ maxWidth:'480px', margin:'40px auto', textAlign:'center' }}>
        <div className="ip-card" style={{ padding:'50px 30px' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>❌</div>
          <h2 style={{ color:'#e63946', marginBottom:'10px' }}>Application Not Approved</h2>
          <p style={{ color:'#78909c', fontSize:'14px', lineHeight:'1.6', marginBottom:'20px' }}>
            Your application could not be approved at this time. This is typically due to elevated geo-political risk factors associated with your investment country.
          </p>
          <div style={{ background:'rgba(230,57,70,0.06)', border:'1px solid rgba(230,57,70,0.18)', borderRadius:'10px', padding:'12px' }}>
            <p style={{ color:'#90a4ae', margin:0, fontSize:'12px' }}>
              If you believe this is an error or would like to appeal, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // SCREEN: PORTFOLIO
  // ════════════════════════════════════════════════════════════
  if (screen === 'portfolio') {
    if (loadingData) return (
      <div className="ip-container">
        <Header />
        <div className="ip-loading"><span className="ip-spinner">⏳</span>Loading your portfolio...</div>
      </div>
    );

    const inv = profile || {};
    const pieData = utilization?.utilization_timeline?.map(s => ({ name: s.name, value: s.percentage })) || [];

    return (
      <div className="ip-container">
        <Header />

        {/* Status strip */}
        <div className="ip-status-strip">
          {[
            ['Investment Status', inv.investment_status ? `● ${inv.investment_status}` : '—', statusColor[inv.investment_status] || '#00e5ff'],
            ['Decision',         inv.decision || '—',    decisionColor[inv.decision] || '#fff'],
            ['Amount Invested',  fmt(inv.amount),        '#00e5ff'],
            ['Projected Value',  fmt(metrics?.projected_value), '#00e676'],
          ].map(([label, value, color]) => (
            <div key={label} className="ip-status-card">
              <span className="ip-status-label">{label}</span>
              <span className="ip-status-value" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ip-tabs">
          {[['overview','📊 Overview'],['returns','📈 Returns'],['utilization','💰 Fund Utilization']].map(([tab, label]) => (
            <button key={tab} className={`ip-tab ${activeTab === tab ? 'ip-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="ip-tab-content">
            <div className="ip-grid-2">
              <div className="ip-card">
                <div className="ip-card-title">👤 Investment Details</div>
                {[
                  ['Name',       inv.name],
                  ['Email',      inv.email],
                  ['Country',    `📍 ${inv.country}`],
                  ['Project',    inv.project_name],
                  ['Fund Type',  inv.fund_type],
                  ['Registered', inv.timestamp ? new Date(inv.timestamp).toLocaleDateString() : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="ip-row">
                    <span>{label}</span><strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="ip-card">
                <div className="ip-card-title">💹 Portfolio Metrics</div>
                {[
                  ['Amount Invested',  fmt(inv.amount),                   '#00e5ff'],
                  ['Days Active',      `${metrics?.days_invested || 0} days`, null],
                  ['Progress',         pct(metrics?.progress_percentage),  null],
                  ['Current Return',   fmt(metrics?.final_return),         '#00e676'],
                  ['ROI',              pct(metrics?.roi),                  '#00e676'],
                  ['Projected Value',  fmt(metrics?.projected_value),      '#00e676'],
                ].map(([label, value, color]) => (
                  <div key={label} className="ip-row">
                    <span>{label}</span>
                    <strong style={color ? { color } : {}}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RETURNS ── */}
        {activeTab === 'returns' && (
          <div className="ip-tab-content">
            <div className="ip-metrics-strip">
              {[
                ['Invested',       fmt(metrics?.investment_amount), '#00e5ff'],
                ['Annual Return',  fmt(metrics?.base_annual_return),'#00b4d8'],
                ['Current Return', fmt(metrics?.final_return),      '#00e676'],
                ['ROI',            pct(metrics?.roi),               '#00e676'],
              ].map(([label, value, color]) => (
                <div key={label} className="ip-metric-box">
                  <span className="ip-metric-label">{label}</span>
                  <span className="ip-metric-value" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="ip-card" style={{ marginTop:'20px' }}>
              <div className="ip-card-title">📈 Portfolio Growth</div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill:'#546e7a', fontSize:11 }} tickFormatter={d => d.slice(0,7)} />
                    <YAxis tick={{ fill:'#546e7a', fontSize:11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background:'#1a2e40', border:'1px solid #00b4d8', borderRadius:'8px' }}
                      formatter={v => [`$${Number(v).toLocaleString()}`]} />
                    <Line type="monotone" dataKey="cumulative" name="Portfolio Value" stroke="#00e676" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="return"     name="Return"          stroke="#00b4d8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p style={{ color:'#546e7a', textAlign:'center', padding:'40px' }}>No return data yet.</p>}
            </div>
            {monthlyData.length > 0 && (
              <div className="ip-card" style={{ marginTop:'20px' }}>
                <div className="ip-card-title">📅 Monthly Breakdown</div>
                <div style={{ overflowX:'auto' }}>
                  <table className="ip-table">
                    <thead><tr><th>Month</th><th>Date</th><th>Return</th><th>Portfolio Value</th><th>Progress</th></tr></thead>
                    <tbody>
                      {monthlyData.map((row, i) => (
                        <tr key={i}>
                          <td>{row.month}</td>
                          <td>{row.date}</td>
                          <td style={{ color:'#00e676' }}>{fmt(row.return)}</td>
                          <td style={{ color:'#00e5ff' }}>{fmt(row.cumulative)}</td>
                          <td>{pct(row.progress)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── UTILIZATION ── */}
        {activeTab === 'utilization' && utilization && (
          <div className="ip-tab-content">
            <div className="ip-metrics-strip">
              {[
                ['Total Investment',  fmt(utilization.utilization_summary.total_investment),  '#00e5ff'],
                ['Capital Deployed',  fmt(utilization.utilization_summary.total_utilized),    '#00b4d8'],
                ['Est. Revenue',      fmt(utilization.utilization_summary.estimated_revenue), '#00e676'],
                ['Your Return (12%)', fmt(utilization.utilization_summary.estimated_return),  '#00e676'],
              ].map(([label, value, color]) => (
                <div key={label} className="ip-metric-box">
                  <span className="ip-metric-label">{label}</span>
                  <span className="ip-metric-value" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="ip-grid-2" style={{ marginTop:'20px' }}>
              <div className="ip-card">
                <div className="ip-card-title">Capital Allocation</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                      label={({ value }) => `${value}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `${v}%`}
                      contentStyle={{ background:'#1a2e40', border:'1px solid #00b4d8', borderRadius:'8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ip-card">
                <div className="ip-card-title">Amount by Stage</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={utilization.utilization_timeline} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill:'#546e7a', fontSize:10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fill:'#b0bec5', fontSize:10 }} width={120} />
                    <Tooltip contentStyle={{ background:'#1a2e40', border:'1px solid #00b4d8', borderRadius:'8px' }}
                      formatter={v => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="amount_spent">
                      {utilization.utilization_timeline.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="ip-card" style={{ marginTop:'20px' }}>
              <div className="ip-card-title">📋 Stage Breakdown</div>
              {utilization.utilization_timeline.map((stage, i) => (
                <div key={i} className="ip-stage-row">
                  <div className="ip-stage-icon">{stage.icon}</div>
                  <div className="ip-stage-info">
                    <div className="ip-stage-name">{stage.name}<span className="ip-stage-days"> · Days {stage.days}</span></div>
                    <div className="ip-stage-desc">{stage.description}</div>
                    <div className="ip-score-bar-track" style={{ marginTop:'6px' }}>
                      <div className="ip-score-bar-fill" style={{ width:`${stage.percentage}%`, background:COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                  <div className="ip-stage-amounts">
                    <span style={{ color:COLORS[i % COLORS.length], fontWeight:'bold' }}>{fmt(stage.amount_spent)}</span>
                    <span style={{ color:'#546e7a', fontSize:'12px' }}>{stage.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}
