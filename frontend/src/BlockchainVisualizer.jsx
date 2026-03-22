// BlockchainVisualizer.jsx — Animated Blockchain Visualizer
import React, { useState, useEffect, useRef } from 'react';
import './BlockchainVisualizer.css';

const BASE_URL = 'http://127.0.0.1:5000';

const BlockchainVisualizer = ({ onBack }) => {
  const [blocks,       setBlocks]       = useState([]);
  const [chainValid,   setChainValid]   = useState(null);
  const [selectedBlock,setSelectedBlock]= useState(null);
  const [loading,      setLoading]      = useState(true);
  const [animating,    setAnimating]    = useState(false);
  const [verifying,    setVerifying]    = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const chainRef = useRef(null);

  useEffect(() => {
    fetchChain();
  }, []);

  // Animate blocks appearing one by one
  useEffect(() => {
    if (blocks.length === 0) return;
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= blocks.length) clearInterval(interval);
    }, 150);
    return () => clearInterval(interval);
  }, [blocks]);

  const fetchChain = async () => {
    setLoading(true);
    try {
      const [investorsRes, chainRes] = await Promise.all([
        fetch(`${BASE_URL}/a_investors`),
        fetch(`${BASE_URL}/validate_chain`),
      ]);
      const investors = await investorsRes.json();
      const chain     = await chainRes.json();
      setBlocks(Array.isArray(investors) ? investors : []);
      setChainValid(chain.status === 'CHAIN_VALID' || chain.status === 'EMPTY_CHAIN');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const verifyChain = async () => {
    setVerifying(true);
    setAnimating(true);
    try {
      const res  = await fetch(`${BASE_URL}/validate_chain`);
      const data = await res.json();
      setChainValid(data.status === 'CHAIN_VALID' || data.status === 'EMPTY_CHAIN');
    } catch {}
    setTimeout(() => setAnimating(false), 2000);
    setVerifying(false);
  };

  const decisionColor = (d) =>
    d === 'APPROVED' ? '#00e676' : d === 'REJECTED' ? '#e63946' : '#f4a261';

  const statusColor = (s) =>
    s === 'ACTIVE' ? '#00e5ff' : s === 'FROZEN' ? '#e63946' :
    s === 'LOCKED' ? '#f4a261' : '#ffb74d';

  const shortHash = (h) => h ? `${h.slice(0, 8)}...${h.slice(-8)}` : 'GENESIS';

  const blockColor = (inv, idx) => {
    if (!chainValid) return '#e63946';
    if (inv.decision === 'APPROVED') return '#00b4d8';
    if (inv.decision === 'REJECTED') return '#e63946';
    return '#f4a261';
  };

  if (loading) return (
    <div className="bv-container">
      <div className="bv-loading">
        <div className="bv-loading-chain">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="bv-loading-block" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p>Loading blockchain...</p>
      </div>
    </div>
  );

  return (
    <div className="bv-container">

      {/* ── Header ── */}
      <div className="bv-header">
        <div>
          <h1>⛓️ Blockchain Visualizer</h1>
          <p className="bv-subtitle">
            {blocks.length} blocks · SHA-256 Hash Chain
          </p>
        </div>
        <div className="bv-header-actions">
          <div className={`bv-status-badge ${chainValid ? 'bv-status-valid' : 'bv-status-invalid'}`}>
            {chainValid ? '🟢 CHAIN VALID' : '🔴 TAMPER DETECTED'}
          </div>
          <button onClick={verifyChain} disabled={verifying} className="bv-btn-verify">
            {verifying ? '⏳ Verifying...' : '🔍 Verify Chain'}
          </button>
          <button onClick={fetchChain} className="bv-btn-refresh">🔄 Refresh</button>
          <button onClick={onBack} className="bv-btn-back">← Back</button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="bv-stats">
        {[
          ['Total Blocks',    blocks.length,                                          '#00e5ff'],
          ['Approved',        blocks.filter(b => b.decision === 'APPROVED').length,   '#00e676'],
          ['Under Review',    blocks.filter(b => b.decision === 'REVIEW').length,     '#f4a261'],
          ['Rejected',        blocks.filter(b => b.decision === 'REJECTED').length,   '#e63946'],
          ['Active',          blocks.filter(b => b.investment_status === 'ACTIVE').length, '#00b4d8'],
        ].map(([label, value, color]) => (
          <div key={label} className="bv-stat-box">
            <span className="bv-stat-value" style={{ color }}>{value}</span>
            <span className="bv-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Chain ── */}
      <div className="bv-chain-wrapper" ref={chainRef}>
        {blocks.length === 0 ? (
          <div className="bv-empty">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⛓️</div>
            <p>No blocks in the chain yet.</p>
            <p style={{ fontSize: '13px', color: '#546e7a' }}>Register investors to see the blockchain visualized.</p>
          </div>
        ) : (
          <div className="bv-chain">
            {/* Genesis block */}
            <div className={`bv-block bv-genesis ${visibleCount > 0 ? 'bv-block-visible' : ''} ${animating ? 'bv-pulse' : ''}`}>
              <div className="bv-block-header">
                <span className="bv-block-num">#0</span>
                <span className="bv-block-type">GENESIS</span>
              </div>
              <div className="bv-block-body">
                <div className="bv-block-field">
                  <span>Hash</span>
                  <code>GENESIS</code>
                </div>
                <div className="bv-block-field">
                  <span>Type</span>
                  <code>Origin Block</code>
                </div>
              </div>
              <div className="bv-block-footer genesis-footer">⚡ Chain Origin</div>
            </div>

            {blocks.map((inv, idx) => (
              <React.Fragment key={inv._id}>
                {/* Connector */}
                <div className={`bv-connector ${idx < visibleCount ? 'bv-connector-visible' : ''} ${!chainValid ? 'bv-connector-broken' : ''} ${animating ? 'bv-connector-pulse' : ''}`}>
                  <div className="bv-connector-line" />
                  <div className="bv-connector-arrow">▶</div>
                  <div className="bv-connector-hash">
                    <code>{shortHash(inv.previous_hash)}</code>
                  </div>
                </div>

                {/* Block */}
                <div
                  className={`bv-block ${idx < visibleCount ? 'bv-block-visible' : ''} ${selectedBlock?._id === inv._id ? 'bv-block-selected' : ''} ${!chainValid ? 'bv-block-tampered' : ''} ${animating ? 'bv-pulse' : ''}`}
                  style={{ '--block-color': blockColor(inv, idx) }}
                  onClick={() => setSelectedBlock(selectedBlock?._id === inv._id ? null : inv)}
                >
                  <div className="bv-block-header">
                    <span className="bv-block-num">#{idx + 1}</span>
                    <span className="bv-block-decision" style={{ color: decisionColor(inv.decision) }}>
                      {inv.decision}
                    </span>
                  </div>

                  <div className="bv-block-body">
                    <div className="bv-block-name">{inv.name}</div>
                    <div className="bv-block-country">📍 {inv.country}</div>
                    <div className="bv-block-amount">${Number(inv.amount).toLocaleString()}</div>

                    <div className="bv-block-field" style={{ marginTop: '10px' }}>
                      <span>Status</span>
                      <span style={{ color: statusColor(inv.investment_status), fontWeight: 'bold' }}>
                        {inv.investment_status}
                      </span>
                    </div>

                    <div className="bv-block-field">
                      <span>Hash</span>
                      <code className="bv-hash">{shortHash(inv.transaction_hash)}</code>
                    </div>

                    <div className="bv-block-field">
                      <span>Time</span>
                      <code style={{ fontSize: '10px' }}>
                        {inv.timestamp ? new Date(inv.timestamp).toLocaleDateString() : '—'}
                      </code>
                    </div>
                  </div>

                  <div className="bv-block-footer" style={{ background: `${blockColor(inv, idx)}22`, color: blockColor(inv, idx) }}>
                    {inv.fund_type || 'Investment'}
                  </div>

                  <div className="bv-block-glow" style={{ background: blockColor(inv, idx) }} />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected block detail panel ── */}
      {selectedBlock && (
        <div className="bv-detail-panel">
          <div className="bv-detail-header">
            <h3>🔍 Block Details — {selectedBlock.name}</h3>
            <button onClick={() => setSelectedBlock(null)} className="bv-detail-close">✕</button>
          </div>
          <div className="bv-detail-grid">
            {[
              ['Investor',      selectedBlock.name],
              ['Email',         selectedBlock.email],
              ['Country',       selectedBlock.country],
              ['Amount',        `$${Number(selectedBlock.amount).toLocaleString()}`],
              ['Project',       selectedBlock.project_name],
              ['Fund Type',     selectedBlock.fund_type],
              ['Decision',      selectedBlock.decision],
              ['Status',        selectedBlock.investment_status],
              ['Trust Score',   selectedBlock.trust_score],
              ['Risk Score',    selectedBlock.risk_score],
              ['Timestamp',     selectedBlock.timestamp ? new Date(selectedBlock.timestamp).toLocaleString() : '—'],
            ].map(([label, value]) => (
              <div key={label} className="bv-detail-row">
                <span>{label}</span>
                <strong style={{
                  color: label === 'Decision' ? decisionColor(value) :
                         label === 'Status'   ? statusColor(value)   : '#e0e0e0'
                }}>{value}</strong>
              </div>
            ))}
            <div className="bv-detail-hash-section">
              <div className="bv-detail-hash-label">Transaction Hash (SHA-256)</div>
              <code className="bv-detail-hash-value">{selectedBlock.transaction_hash}</code>
            </div>
            <div className="bv-detail-hash-section">
              <div className="bv-detail-hash-label">Previous Block Hash</div>
              <code className="bv-detail-hash-value">{selectedBlock.previous_hash}</code>
            </div>
          </div>
        </div>
      )}

      {/* ── Tamper warning overlay ── */}
      {chainValid === false && (
        <div className="bv-tamper-banner">
          ⚠️ BLOCKCHAIN INTEGRITY COMPROMISED — TAMPER DETECTED — SYSTEM FROZEN
        </div>
      )}

    </div>
  );
};

export default BlockchainVisualizer;
