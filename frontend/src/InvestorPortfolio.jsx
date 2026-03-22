// InvestorPortfolio.jsx
// Investor Portfolio Page with real-time calculations, interactive charts, and blockchain timeline
// Features: Investment metrics, project progress, return calculations, risk analysis, and secure timeline

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import './InvestorPortfolio.css';

const InvestorPortfolio = ({ investorId, onBack }) => {
  const [investor, setInvestor] = useState(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [returnHistory, setReturnHistory] = useState([]);
  const [hashVerified, setHashVerified] = useState(null);
  const [fundUtilization, setFundUtilization] = useState(null);

  // Fetch investor data on mount
  useEffect(() => {
    fetchInvestorData();
  }, [investorId]);

  // Calculate metrics when investor data updates
  useEffect(() => {
    if (investor) {
      calculatePortfolioMetrics();
      generateTimelineEvents();
      generateReturnHistory();
      verifyBlockchainHash();
      fetchFundUtilization();
    }
  }, [investor]);

  // Auto-refresh metrics every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchInvestorData, 10000);
    return () => clearInterval(interval);
  }, [investorId]);

  const fetchInvestorData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/s_investor/${investorId}`);
      if (!response.ok) throw new Error('Failed to fetch investor');
      const data = await response.json();
      setInvestor(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching investor:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyBlockchainHash = async () => {
    try {
      const response = await fetch(`http://localhost:5000/verify_hash/${investorId}`);
      const data = await response.json();
      setHashVerified(data.verified);
    } catch (err) {
      console.error('Hash verification error:', err);
    }
  };

  const fetchFundUtilization = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fund_utilization/${investorId}`);
      if (response.ok) {
        const data = await response.json();
        setFundUtilization(data);
      }
    } catch (err) {
      console.error('Error fetching fund utilization:', err);
    }
  };

  const calculatePortfolioMetrics = () => {
    if (!investor) return;

    const investmentAmount = Number(investor.amount) || 0;
    const baseReturnRate = 0.12; // 12% annual return
    const trustScore = Number(investor.trust_score) || 0;
    const trustScoreFactor = (trustScore / 100) * 1.0; // 0-1 multiplier
    
    const investmentDate = new Date(investor.timestamp);
    const today = new Date();
    const daysInvested = Math.floor((today - investmentDate) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min((daysInvested / 365) * 100, 100);

    // Calculate returns: Investment × 12% × progress% × trust score factor
    const projectedAnnualReturn = investmentAmount * baseReturnRate;
    const timeBasedReturn = projectedAnnualReturn * (progressPercentage / 100);
    const trustAdjustedReturn = timeBasedReturn * (0.5 + trustScoreFactor); // min 0.5x, max 1.5x
    const amountReturned = trustAdjustedReturn;

    // Calculate key metrics
    const roi = investmentAmount > 0 ? ((amountReturned / investmentAmount) * 100).toFixed(2) : 0;
    const projectedValue = investmentAmount + amountReturned;

    // Risk and returns breakdown
    const riskScore = Number(investor.risk_score) || 0;
    const riskAdjustment = Math.max(0, 1 - (riskScore / 100) * 0.3); // Risk reduces returns by up to 30%
    const riskAdjustedReturn = amountReturned * riskAdjustment;

    setPortfolioMetrics({
      investmentAmount: parseFloat(investmentAmount.toFixed(2)),
      daysInvested,
      progressPercentage: parseFloat(progressPercentage.toFixed(1)),
      projectedAnnualReturn: parseFloat(projectedAnnualReturn.toFixed(2)),
      timeBasedReturn: parseFloat(timeBasedReturn.toFixed(2)),
      trustAdjustedReturn: parseFloat(trustAdjustedReturn.toFixed(2)),
      riskAdjustedReturn: parseFloat(riskAdjustedReturn.toFixed(2)),
      amountReturned: parseFloat(riskAdjustedReturn.toFixed(2)),
      projectedValue: parseFloat((investmentAmount + riskAdjustedReturn).toFixed(2)),
      roi: parseFloat(roi),
      trustScoreFactor: parseFloat((trustScoreFactor * 100).toFixed(1)),
      riskAdjustmentFactor: parseFloat((riskAdjustment * 100).toFixed(1)),
      riskScore: riskScore,
      decision: investor.decision || 'PENDING',
      status: investor.investment_status || 'ACTIVE',
      transactionHash: investor.transaction_hash,
      previousHash: investor.previous_hash,
    });
  };

  const generateTimelineEvents = () => {
    if (!investor || !portfolioMetrics) return;

    const baseDate = new Date(investor.timestamp);
    const today = new Date();
    const daysInvested = portfolioMetrics.daysInvested;

    const events = [
      {
        date: baseDate,
        title: 'Investment Registered',
        description: `Initial investment of $${portfolioMetrics.investmentAmount.toLocaleString()} recorded on blockchain`,
        status: 'completed',
        icon: '💰',
        hash: investor.transaction_hash?.substring(0, 16) + '...',
        days: 0,
      },
      {
        date: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        title: 'First Review',
        description: `Risk & Trust scores evaluated. Decision: ${investor.decision}`,
        status: daysInvested >= 30 ? 'completed' : 'pending',
        icon: '📋',
        days: 30,
      },
      {
        date: new Date(baseDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        title: 'Quarterly Update',
        description: 'Project progress milestone reached (25%)',
        status: daysInvested >= 90 ? 'completed' : 'pending',
        icon: '📊',
        days: 90,
      },
      {
        date: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000),
        title: 'Mid-Year Review',
        description: 'Performance assessment and return accrual (50%)',
        status: daysInvested >= 180 ? 'completed' : 'pending',
        icon: '📈',
        days: 180,
      },
      {
        date: new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        title: 'Annual Maturity',
        description: 'Investment maturity reached. Returns settlement.',
        status: daysInvested >= 365 ? 'completed' : 'pending',
        icon: '🎯',
        days: 365,
      },
    ];

    setTimelineEvents(events);
  };

  const generateReturnHistory = () => {
    if (!investor || !portfolioMetrics) return;

    const startDate = new Date(investor.timestamp);
    const history = [];
    const maxMonths = Math.min(12, Math.floor(portfolioMetrics.daysInvested / 30) + 1);

    for (let i = 0; i <= maxMonths; i++) {
      const currentDate = new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const daysElapsed = i * 30;
      const progress = Math.min((daysElapsed / 365) * 100, 100);
      
      const investmentAmount = portfolioMetrics.investmentAmount;
      const trustFactor = (Number(investor.trust_score) || 0) / 100;
      const riskFactor = Math.max(0, 1 - (portfolioMetrics.riskScore / 100) * 0.3);
      
      const baseReturnRate = 0.12;
      const monthlyReturn = investmentAmount * baseReturnRate * (progress / 100) * (0.5 + trustFactor) * riskFactor;

      history.push({
        month: i === 0 ? 'Start' : `Month ${i}`,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        return: parseFloat(monthlyReturn.toFixed(2)),
        cumulative: parseFloat((investmentAmount + monthlyReturn).toFixed(2)),
        progress: parseFloat(progress.toFixed(1)),
      });
    }

    setReturnHistory(history);
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': '#00e676',
      'FROZEN': '#ff4d4d',
      'LOCKED': '#ff9800',
      'REDIRECTED': '#ffb74d',
    };
    return colors[status] || '#546e7a';
  };

  const getDecisionColor = (decision) => {
    const colors = {
      'APPROVED': '#00e676',
      'REJECTED': '#ff4d4d',
      'REVIEW': '#ffb74d',
      'PENDING': '#546e7a',
    };
    return colors[decision] || '#546e7a';
  };

  if (loading) {
    return (
      <div className="portfolio-container portfolio-loading">
        <div className="loading-spinner" />
        <p>Loading investor portfolio...</p>
      </div>
    );
  }

  if (error || !investor || !portfolioMetrics) {
    return (
      <div className="portfolio-container portfolio-error">
        <div className="error-content">
          <h2>❌ Portfolio Error</h2>
          <p>{error || 'Failed to load investor data'}</p>
          <button className="btn-primary" onClick={onBack}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      {/* Header with back button */}
      <div className="portfolio-header">
        <button className="btn-back" onClick={onBack} title="Return to dashboard">
          ← Back to Dashboard
        </button>
        <div className="header-title">
          <h1>📊 {investor.name || 'Investor'} Portfolio</h1>
          <p className="header-subtitle">
            {investor.country} • {investor.project_name || 'Cross-Border Investment'}
          </p>
        </div>
        <div className="header-status">
          <div className="status-badge" style={{ borderColor: getStatusColor(portfolioMetrics.status) }}>
            <span className="status-indicator" style={{ background: getStatusColor(portfolioMetrics.status) }} />
            {portfolioMetrics.status}
          </div>
          <div className="status-badge" style={{ borderColor: getDecisionColor(portfolioMetrics.decision) }}>
            {portfolioMetrics.decision}
          </div>
        </div>
      </div>

      {/* Blockchain verification banner */}
      {hashVerified !== null && (
        <div className="blockchain-banner" style={{ 
          background: hashVerified ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          borderColor: hashVerified ? '#4caf50' : '#f44336'
        }}>
          {hashVerified ? '✅' : '❌'} Blockchain Hash {hashVerified ? 'Verified' : 'Invalid'}
          <span style={{ fontSize: '11px', marginLeft: '8px', opacity: 0.7 }}>
            {investor.transaction_hash?.substring(0, 20)}...
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {['overview', 'analytics', 'utilization', 'timeline', 'blockchain'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '💰 Overview'}
            {tab === 'analytics' && '📈 Analytics'}
            {tab === 'utilization' && '💸 Fund Utilization'}
            {tab === 'timeline' && '📅 Timeline'}
            {tab === 'blockchain' && '🔗 Blockchain'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">💰 Investment Amount</div>
              <div className="metric-value">${portfolioMetrics.investmentAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
              <div className="metric-subtext">Initial capital deployed</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">🏗️ Days Invested</div>
              <div className="metric-value">{portfolioMetrics.daysInvested}</div>
              <div className="metric-subtext">{portfolioMetrics.progressPercentage}% of year 1</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">📈 Annual Return Rate</div>
              <div className="metric-value">12%</div>
              <div className="metric-subtext">Base rate (adjustable by risk & trust)</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">✅ Trust Score Factor</div>
              <div className="metric-value">{(portfolioMetrics.trustScoreFactor).toFixed(1)}%</div>
              <div className="metric-subtext">From investor metrics</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">⚠️ Risk Adjustment</div>
              <div className="metric-value">{portfolioMetrics.riskAdjustmentFactor.toFixed(1)}%</div>
              <div className="metric-subtext">Risk score: {portfolioMetrics.riskScore}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">💵 Amount Returned (YTD)</div>
              <div className="metric-value" style={{ color: '#00e676' }}>
                ${portfolioMetrics.amountReturned.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              <div className="metric-subtext">Risk & time-adjusted returns</div>
            </div>
          </div>

          {/* Projected Value Card */}
          <div className="full-width-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h3>Projected Portfolio Value (Year 1)</h3>
                <p style={{ color: '#546e7a', fontSize: '13px', margin: '4px 0 0' }}>
                  Based on 12% annual return with time, trust, and risk adjustments
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00e676' }}>
                  ${portfolioMetrics.projectedValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '13px', color: '#80cbc4', marginTop: '4px' }}>
                  +${portfolioMetrics.amountReturned.toLocaleString('en-US', { maximumFractionDigits: 2 })} ({portfolioMetrics.roi}% ROI)
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="full-width-card">
            <h3>Return Calculation Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
              <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
                <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '4px' }}>1️⃣ Base Annual Return</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00e676' }}>
                  ${portfolioMetrics.projectedAnnualReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                  {portfolioMetrics.investmentAmount} × 12%
                </div>
              </div>

              <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '4px' }}>2️⃣ Time-Based Accrual</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00e5ff' }}>
                  ${portfolioMetrics.timeBasedReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                  Base × {portfolioMetrics.progressPercentage}%
                </div>
              </div>

              <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 235, 59, 0.3)' }}>
                <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '4px' }}>3️⃣ Trust-Adjusted Return</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffd700' }}>
                  ${portfolioMetrics.trustAdjustedReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                  Time × (0.5 + {(portfolioMetrics.trustScoreFactor / 100).toFixed(2)})
                </div>
              </div>

              <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)', gridColumn: 'span 1' }}>
                <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '4px' }}>4️⃣ Final (Risk-Adjusted)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50' }}>
                  ${portfolioMetrics.amountReturned.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                  Trust × {(portfolioMetrics.riskAdjustmentFactor).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && returnHistory.length > 0 && (
        <div className="tab-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
            {/* Return History Chart */}
            <div className="full-width-card">
              <h3>Return Accrual Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={returnHistory}>
                  <defs>
                    <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e676" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e676" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#546e7a" />
                  <YAxis stroke="#546e7a" />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 32, 39, 0.95)', border: '1px solid rgba(0, 230, 118, 0.3)' }}
                    formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  />
                  <Area type="monotone" dataKey="return" stroke="#00e676" fill="url(#returnGradient)" name="Monthly Return" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative Value Chart */}
            <div className="full-width-card">
              <h3>Cumulative Portfolio Value</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={returnHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#546e7a" />
                  <YAxis stroke="#546e7a" />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 32, 39, 0.95)', border: '1px solid rgba(0, 229, 255, 0.3)' }}
                    formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cumulative" stroke="#00e5ff" name="Portfolio Value" strokeWidth={2} dot={{ fill: '#00e5ff', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Progress Pie Chart */}
            <div className="full-width-card">
              <h3>Investment Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Remaining', value: 100 - portfolioMetrics.progressPercentage },
                      { name: 'Completed', value: portfolioMetrics.progressPercentage }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#00e676" />
                    <Cell fill="rgba(255,255,255,0.1)" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00e676' }}>
                  {portfolioMetrics.progressPercentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#546e7a' }}>
                  {portfolioMetrics.daysInvested} of 365 days invested
                </div>
              </div>
            </div>

            {/* Returns Composition */}
            <div className="full-width-card">
              <h3>Returns Composition</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Base Annual',
                      value: portfolioMetrics.projectedAnnualReturn,
                    },
                    {
                      name: 'Time-Based Accrual',
                      value: portfolioMetrics.timeBasedReturn,
                    },
                    {
                      name: 'Trust-Adjusted',
                      value: portfolioMetrics.trustAdjustedReturn,
                    },
                    {
                      name: 'Final (Risk-Adj)',
                      value: portfolioMetrics.amountReturned,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#546e7a" />
                  <YAxis stroke="#546e7a" />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 32, 39, 0.95)', border: '1px solid rgba(0, 229, 255, 0.3)' }}
                    formatter={(value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                  />
                  <Bar dataKey="value" fill="#00e5ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* FUND UTILIZATION TAB */}
      {activeTab === 'utilization' && fundUtilization && (
        <div className="tab-content">
          <div className="full-width-card">
            <h3>💸 Fund Utilization Journey</h3>
            <p style={{ color: '#546e7a', fontSize: '13px', marginBottom: '20px' }}>
              How your investment is allocated and utilized across project stages
            </p>
          </div>

          {/* Timeline of Fund Utilization */}
          <div className="timeline-container">
            {fundUtilization.utilization_timeline && fundUtilization.utilization_timeline.map((stage, idx) => (
              <div key={idx} className="timeline-event timeline-completed">
                <div className="timeline-marker">
                  <div className="timeline-icon">{stage.icon || '📊'}</div>
                  <div className="timeline-connector" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{stage.name}</h4>
                    <span className="timeline-date">{stage.days}</span>
                  </div>
                  <p>{stage.description}</p>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                      <div style={{ fontSize: '11px', color: '#546e7a' }}>Amount Spent</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00e5ff' }}>
                        ${stage.amount_spent.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                      <div style={{ fontSize: '11px', color: '#546e7a' }}>Percentage</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4caf50' }}>
                        {stage.percentage}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255, 235, 59, 0.3)' }}>
                      <div style={{ fontSize: '11px', color: '#546e7a' }}>Category</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffd700' }}>
                        {stage.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Utilization Breakdown Pie Chart */}
          {fundUtilization.utilization_timeline && (
            <div className="full-width-card">
              <h3>Fund Allocation Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fundUtilization.utilization_timeline.map(stage => ({
                      name: stage.name,
                      value: stage.amount_spent
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00e5ff" />
                    <Cell fill="#00e676" />
                    <Cell fill="#ffd700" />
                    <Cell fill="#ff6d6d" />
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Utilization Summary */}
          {fundUtilization.utilization_summary && (
            <div className="full-width-card">
              <h3>📊 Fund Utilization Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px' }}>Total Investment</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00e5ff' }}>
                    ${fundUtilization.utilization_summary.total_investment.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px' }}>Total Utilized</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                    ${fundUtilization.utilization_summary.total_utilized.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                    {fundUtilization.utilization_summary.utilization_percentage}% utilized
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255, 235, 59, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px' }}>Estimated Revenue</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd700' }}>
                    ${fundUtilization.utilization_summary.estimated_revenue.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(165, 214, 167, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(165, 214, 167, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px' }}>Estimated Return to Investor</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a5d6a7' }}>
                    ${fundUtilization.utilization_summary.estimated_return.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(100, 200, 255, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(100, 200, 255, 0.3)', gridColumn: 'span 1' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px' }}>Final Amount (100% Utilization)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#64c8ff' }}>
                    ${fundUtilization.utilization_summary.final_amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '4px' }}>
                    Principal + Estimated Return
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="tab-content">
          <div className="timeline-container">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className={`timeline-event timeline-${event.status}`}>
                <div className="timeline-marker">
                  <div className="timeline-icon">{event.icon}</div>
                  <div className="timeline-connector" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{event.title}</h4>
                    <span className="timeline-date">{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <p>{event.description}</p>
                  {event.hash && <div className="timeline-hash">🔗 {event.hash}</div>}
                  <div className="timeline-status" style={{ color: event.status === 'completed' ? '#00e676' : '#546e7a' }}>
                    {event.status === 'completed' ? '✓ Completed' : '⏳ Upcoming'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOCKCHAIN TAB */}
      {activeTab === 'blockchain' && (
        <div className="tab-content">
          <div className="full-width-card">
            <h3>🔗 Blockchain Security Information</h3>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction Hash</div>
                  <div style={{ fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#00e676', wordBreak: 'break-all' }}>
                    {investor.transaction_hash}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '8px' }}>
                    This unique hash certifies the immutability of this investment record on the blockchain.
                  </div>
                </div>

                <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous Hash</div>
                  <div style={{ fontSize: '12px', fontFamily: "'Courier New', monospace", color: '#00e5ff', wordBreak: 'break-all' }}>
                    {investor.previous_hash}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '8px' }}>
                    Links to the previous block in the chain, ensuring sequential integrity.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255, 235, 59, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hash Verification Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {hashVerified === null ? '⏳' : hashVerified ? '✅' : '❌'}
                    </span>
                    <span style={{ color: hashVerified === null ? '#546e7a' : hashVerified ? '#00e676' : '#ff4d4d', fontWeight: '500' }}>
                      {hashVerified === null ? 'Verifying...' : hashVerified ? 'Hash Verified' : 'Hash Invalid'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '8px' }}>
                    {hashVerified === null 
                      ? 'Checking blockchain integrity...'
                      : hashVerified 
                        ? 'This investment record has not been tampered with.'
                        : 'Warning: This record may have been modified.'}
                  </div>
                </div>

                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: '#546e7a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investment Timestamp</div>
                  <div style={{ fontSize: '12px', color: '#4caf50', fontFamily: "'Courier New', monospace" }}>
                    {new Date(investor.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909c', marginTop: '8px' }}>
                    Exact date and time this investment was recorded on the blockchain.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="portfolio-footer">
        <button className="btn-back" onClick={onBack}>← Back to Dashboard</button>
        <span style={{ fontSize: '12px', color: '#546e7a' }}>
          Portfolio last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default InvestorPortfolio;
