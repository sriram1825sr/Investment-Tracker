// AuditLog.jsx - Confidential Document Style
// Fully implemented audit log viewer with stats strip

import React, { useState, useEffect } from 'react';
import './AuditLog.css';

const AuditLog = ({ onBack }) => {
  const [logs,        setLogs]        = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filterType,  setFilterType]  = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate,  setFilterDate]  = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAuditLogs(), fetchStats()]);
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('https://investment-tracker-3-1tf2.onrender.com/audit_logs');
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLogs([]);
      console.error('Error fetching logs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://investment-tracker-3-1tf2.onrender.com/audit_stats');
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch {
      // Stats are optional — don't block on failure
    }
  };

  const getActionColor = (action = '') => {
    if (action.includes('CREATE'))  return '#00e676';
    if (action.includes('UPDATE'))  return '#00e5ff';
    if (action.includes('DELETE'))  return '#ff4d4d';
    if (action.includes('TAMPER'))  return '#ff6d00';
    if (action.includes('LOGIN'))   return '#ffd700';
    if (action.includes('RESET'))   return '#ce93d8';
    if (action.includes('REBUILD')) return '#ffb74d';
    if (action.includes('VIEW'))    return '#80cbc4';
    return '#546e7a';
  };

  const getStatusSymbol = (status = '') => {
    if (status === 'SUCCESS') return '✓';
    if (status === 'FAILED')  return '✗';
    if (status === 'WARNING') return '⚠';
    return '•';
  };

  const filterLogs = () => {
    let filtered = logs;

    if (filterType !== 'all') {
      filtered = filtered.filter(log =>
        (log.action || '').includes(filterType.toUpperCase())
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        (log.investor_name || '').toLowerCase().includes(q) ||
        (log.action        || '').toLowerCase().includes(q) ||
        (log.user          || '').toLowerCase().includes(q) ||
        (log.investor_id   || '').toLowerCase().includes(q)
      );
    }

    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        if (filterDate === 'today') {
          return logTime.toDateString() === now.toDateString();
        } else if (filterDate === 'week') {
          return logTime >= new Date(now.getTime() - 7  * 86400000);
        } else if (filterDate === 'month') {
          return logTime >= new Date(now.getTime() - 30 * 86400000);
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredLogs = filterLogs();

  // ── Counts for the stats strip ──────────────────────────
  const countByStatus = (s) => logs.filter(l => l.status === s).length;
  const todayCount = logs.filter(l => {
    try {
      return new Date(l.timestamp).toDateString() === new Date().toDateString();
    } catch { return false; }
  }).length;

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="audit-container">
        <div className="audit-loading">
          <span className="audit-loading-spinner">⏳</span>
          Loading audit records...
        </div>
      </div>
    );
  }

  return (
    <div className="audit-container">

      {/* ── Header ── */}
      <div className="audit-header">
        <h1>SYSTEM AUDIT LOG</h1>
        <p className="confidential-label">⛔ CONFIDENTIAL — ADMIN ACCESS ONLY</p>
        <p className="timestamp">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* ── Stats Strip ── */}
      <div className="audit-stats-strip">
        <div className="stat-box">
          <span className="stat-number" style={{ color: '#00e5ff' }}>{logs.length}</span>
          <span className="stat-label">Total Records</span>
        </div>
        <div className="stat-box">
          <span className="stat-number" style={{ color: '#00e676' }}>{countByStatus('SUCCESS')}</span>
          <span className="stat-label">Successful</span>
        </div>
        <div className="stat-box">
          <span className="stat-number" style={{ color: '#ff4d4d' }}>{countByStatus('FAILED')}</span>
          <span className="stat-label">Failed</span>
        </div>
        <div className="stat-box">
          <span className="stat-number" style={{ color: '#ffd700' }}>{todayCount}</span>
          <span className="stat-label">Today's Activity</span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="audit-controls">
        <div className="control-group">
          <label>🔍 Search</label>
          <input
            type="text"
            placeholder="Name, action, user, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="audit-input"
          />
        </div>

        <div className="control-group">
          <label>⚡ Action Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="audit-select"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="LOGIN">Login</option>
            <option value="TAMPER">Tamper Detected</option>
            <option value="RESET">Reset</option>
            <option value="REBUILD">Rebuild</option>
          </select>
        </div>

        <div className="control-group">
          <label>📅 Date Range</label>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="audit-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', color: 'transparent' }}>_</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fetchAll} className="audit-button">🔄 Refresh</button>
            <button onClick={onBack} className="audit-button-back">← Dashboard</button>
          </div>
        </div>
      </div>

      {/* ── Result Count ── */}
      <div className="audit-summary">
        Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> records
        {filterType !== 'all' && <span>  · Filter: <strong style={{ color: getActionColor(filterType) }}>{filterType.toUpperCase()}</strong></span>}
        {filterDate !== 'all' && <span>  · Period: <strong>{filterDate}</strong></span>}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="audit-error">
          ❌ {error} — Make sure the Flask backend is running on port 5000.
        </div>
      )}

      {/* ── Table ── */}
      <div className="audit-logs">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Investor / Resource</th>
              <th>IP Address</th>
              <th>Changes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#546e7a' }}>
                  {logs.length === 0
                    ? '📋 No audit records yet. Actions will appear here once you use the system.'
                    : '🔍 No records match your current filters.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log._id || idx} className="audit-row">

                  <td className="timestamp-cell">
                    {(() => {
                      try {
                        return new Date(log.timestamp).toLocaleString('en-US', {
                          year:   'numeric', month:  '2-digit', day:    '2-digit',
                          hour:   '2-digit', minute: '2-digit', second: '2-digit',
                        });
                      } catch { return log.timestamp || '—'; }
                    })()}
                  </td>

                  <td className="action-cell">
                    <span style={{ color: getActionColor(log.action || '') }}>
                      {log.action || '—'}
                    </span>
                  </td>

                  <td className="user-cell">
                    {log.user || 'system'}
                  </td>

                  <td className="resource-cell">
                    {log.investor_name || log.investor_id || '—'}
                  </td>

                  <td style={{ color: '#78909c', fontSize: '11px' }}>
                    {log.ip_address || '—'}
                  </td>

                  <td className="changes-cell">
                    {log.changes ? (
                      <details>
                        <summary>View details</summary>
                        <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                      </details>
                    ) : '—'}
                  </td>

                  <td className="status-cell">
                    <span style={{
                      color: log.status === 'SUCCESS' ? '#00e676'
                           : log.status === 'FAILED'  ? '#ff4d4d'
                           : '#ffb74d'
                    }}>
                      {getStatusSymbol(log.status)} {log.status || '—'}
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="audit-footer">
        <p>— END OF REPORT —</p>
        <p style={{ marginTop: '8px', fontSize: '11px' }}>
          Confidential system audit log · Unauthorized access is prohibited
        </p>
      </div>

    </div>
  );
};

export default AuditLog;
