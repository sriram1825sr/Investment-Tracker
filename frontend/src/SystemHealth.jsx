// SystemHealth.jsx - System Health Monitor
// Standalone component - does not modify existing code

import React, { useState, useEffect } from 'react';
import './SystemHealth.css';

const SystemHealth = ({ onBack }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
    const response = await fetch('https://investment-tracker-3-1tf2.onrender.com/system_health');
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'HEALTHY') return '#00e676';
    if (status === 'WARNING') return '#ffb74d';
    if (status === 'CRITICAL') return '#ff4d4d';
    return '#546e7a';
  };

  const getStatusIcon = (status) => {
    if (status === 'HEALTHY') return '🟢';
    if (status === 'WARNING') return '🟡';
    if (status === 'CRITICAL') return '🔴';
    return '⚪';
  };

  if (loading) {
    return (
      <div className="health-container">
        <p>Loading system health...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-container">
        <p className="error">Error: {error}</p>
        <button onClick={onBack} className="health-btn-back">Back</button>
      </div>
    );
  }

  return (
    <div className="health-container">
      {/* Header */}
      <div className="health-header">
        <h1>SYSTEM HEALTH MONITOR</h1>
        <p className="health-timestamp">Last updated: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Overall Status */}
      {health && (
        <>
          <div className="health-overall">
            <div className="health-status-badge">
              <span className="status-icon">{getStatusIcon(health.overall_status)}</span>
              <span className="status-text">{health.overall_status}</span>
            </div>
            <button onClick={onBack} className="health-btn-back">← Back</button>
          </div>

          {/* Health Cards Grid */}
          <div className="health-grid">
            {/* Blockchain Health */}
            <div className="health-card">
              <h3>🔗 Blockchain Health</h3>
              <div className="health-metric">
                <span className="metric-label">Status:</span>
                <span className="metric-value" style={{ color: getStatusColor(health.blockchain.status) }}>
                  {getStatusIcon(health.blockchain.status)} {health.blockchain.status}
                </span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Total Blocks:</span>
                <span className="metric-value">{health.blockchain.total_blocks}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Valid Chain:</span>
                <span className="metric-value">{health.blockchain.is_valid ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Last Check:</span>
                <span className="metric-value">{new Date(health.blockchain.last_check).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Database Health */}
            <div className="health-card">
              <h3>💾 Database Health</h3>
              <div className="health-metric">
                <span className="metric-label">Status:</span>
                <span className="metric-value" style={{ color: getStatusColor(health.database.status) }}>
                  {getStatusIcon(health.database.status)} {health.database.status}
                </span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Total Investors:</span>
                <span className="metric-value">{health.database.total_investors}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Total Audit Logs:</span>
                <span className="metric-value">{health.database.total_logs}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">DB Size:</span>
                <span className="metric-value">{health.database.db_size}</span>
              </div>
            </div>

            {/* Investment Health */}
            <div className="health-card">
              <h3>💰 Investment Health</h3>
              <div className="health-metric">
                <span className="metric-label">Total Invested:</span>
                <span className="metric-value">${health.investment.total_invested.toLocaleString()}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Average Trust Score:</span>
                <span className="metric-value">{health.investment.avg_trust_score.toFixed(1)}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Active Investors:</span>
                <span className="metric-value">{health.investment.active_investors}</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">At-Risk Count:</span>
                <span className="metric-value" style={{ color: '#ff4d4d' }}>
                  {health.investment.at_risk_count}
                </span>
              </div>
            </div>

            {/* API Health */}
            <div className="health-card">
              <h3>⚡ API Health</h3>
              <div className="health-metric">
                <span className="metric-label">Status:</span>
                <span className="metric-value" style={{ color: getStatusColor(health.api.status) }}>
                  {getStatusIcon(health.api.status)} {health.api.status}
                </span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Response Time:</span>
                <span className="metric-value">{health.api.response_time}ms</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Uptime:</span>
                <span className="metric-value">{health.api.uptime}%</span>
              </div>
              <div className="health-metric">
                <span className="metric-label">Errors (24h):</span>
                <span className="metric-value">{health.api.errors_24h}</span>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {health.alerts && health.alerts.length > 0 && (
            <div className="health-alerts">
              <h3>⚠️ Alerts</h3>
              {health.alerts.map((alert, idx) => (
                <div key={idx} className="alert-item">
                  <span className="alert-icon">🔔</span>
                  <span className="alert-text">{alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="health-footer">
            <p>Auto-refresh every 10 seconds</p>
            <button onClick={fetchSystemHealth} className="health-btn-refresh">🔄 Refresh Now</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemHealth;
