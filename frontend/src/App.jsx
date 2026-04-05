import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, CloudRain, 
  TrendingDown, ShieldAlert, Cpu, CheckCircle, XCircle 
} from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', city: 'Mumbai', deliveryType: 'Food' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard state
  const [simulation, setSimulation] = useState({ state: 'normal' });
  const [claim, setClaim] = useState(null);

  const riskSettings = {
    'Mumbai': { premium: 40, level: 'High' },
    'Hyderabad': { premium: 30, level: 'Medium' },
    'Bangalore': { premium: 20, level: 'Low' }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        ...formData,
        id: 'USR-' + Math.floor(Math.random() * 100000),
        trustScore: 85
      });
      setIsLoading(false);
    }, 800);
  };

  const calculateClaim = (simType) => {
    setIsLoading(true);
    setSimulation({ state: simType });
    setClaim(null);

    setTimeout(() => {
      let riskScore = 0;
      let reasons = [];
      let isIncomeLoss = false;
      let demandDrop = 0;
      
      // Defaults config based on simulation
      if (simType === 'normal') {
        isIncomeLoss = false;
        demandDrop = 15; // 15% drop, not enough
      } else if (simType === 'rain') {
        isIncomeLoss = true;
        demandDrop = 65; // > 40% triggers loss
        reasons.push({ text: "Heavy rain detected in area", type: "info" });
        reasons.push({ text: "Demand dropped by 65%", type: "info" });
        // No fraud
      } else if (simType === 'fraud') {
        isIncomeLoss = true;
        demandDrop = 55;
        reasons.push({ text: "Speed > 100kmph detected", type: "danger" });
        reasons.push({ text: "Multiple device logins", type: "danger" });
        reasons.push({ text: "IP mismatch anomaly", type: "danger" });
        riskScore += 30; // speed
        riskScore += 25; // device
        riskScore += 15; // ip
      }

      // Base user trust
      if (user.trustScore > 70) {
        riskScore = Math.max(0, riskScore - 10);
        if (simType !== 'normal') {
           reasons.push({ text: "High historical trust reduces risk factor", type: "success" });
        }
      }

      let decision = '';
      let payout = 0;

      if (!isIncomeLoss) {
        decision = 'NO_LOSS';
      } else {
        if (riskScore < 30) {
          decision = 'APPROVED';
          payout = 200;
        } else if (riskScore <= 70) {
          decision = 'VERIFICATION';
          payout = 0;
        } else {
          decision = 'REJECTED';
          payout = 0;
        }
      }

      setClaim({
        triggered: isIncomeLoss,
        demandDrop,
        riskScore,
        decision,
        payout,
        reasons
      });
      
      setIsLoading(false);
    }, 1200);
  };

  if (!user) {
    return (
      <div className="app-container">
        <header className="header">
          <div className="logo"><ShieldCheck color="#60a5fa" /> TrustPay AI</div>
          <div className="status-badge inactive">
            <div className="status-dot"></div> Requires Setup
          </div>
        </header>

        <div className="registration-wrapper">
          <div className="card register-card">
            <h2>Create Your Policy</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
              Parametric insurance for gig workers
            </p>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input required className="form-control" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Operating City</label>
                <select className="form-control" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delivery Segment</label>
                <select className="form-control" value={formData.deliveryType} onChange={e => setFormData({...formData, deliveryType: e.target.value})}>
                  <option value="Food">Food Delivery</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Ecommerce">E-commerce / Packages</option>
                </select>
              </div>
              <button disabled={isLoading} type="submit" className="btn btn-primary">
                {isLoading ? 'Processing...' : 'Activate Policy'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const riskInfo = riskSettings[user.city] || { premium: 20, level: 'Low' };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo"><ShieldCheck color="#60a5fa" /> TrustPay AI</div>
        <div className="user-profile">
          <span style={{ color: 'var(--text-muted)' }}>{user.name} ({user.id})</span>
          <div className="status-badge">
            <div className="status-dot"></div> Active Policy
          </div>
        </div>
      </header>

      <div className="dashboard">
        <div className="premium-banner">
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Weekly Premium</h3>
            <div className="stat-value">₹{riskInfo.premium}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>City Risk Profile</h3>
            <div className="stat-value" style={{ 
              color: riskInfo.level === 'High' ? 'var(--danger)' : riskInfo.level === 'Medium' ? 'var(--warning)' : 'var(--success)'
            }}>
              {riskInfo.level}
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--success)" /> Trust Score
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{user.trustScore}/100</div>
            <div className="progress-container">
              <div className="progress-bar success" style={{ width: `${user.trustScore}%` }}></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="var(--warning)" /> Current Risk State
            </h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: claim && claim.riskScore > 30 ? 'var(--danger)' : 'var(--success)' }}>
              {claim ? claim.riskScore : 0} points
            </div>
            <div className="progress-container">
              <div className="progress-bar warning" style={{ width: `${Math.min(100, claim ? claim.riskScore : 0)}%`, background: claim && claim.riskScore > 50 ? 'var(--danger)' : 'var(--warning)' }}></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={20} color="var(--primary)" /> Income Loss Meter
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>Demand drop vs normal</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {claim ? claim.demandDrop : 15}% Drop
            </div>
            <div className="progress-container">
              <div className={`progress-bar ${claim && claim.demandDrop > 40 ? 'danger' : 'primary'}`} style={{ width: `${claim ? claim.demandDrop : 15}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Simulation & Action */}
          <div className="card">
            <h2>Simulation Panel</h2>
            <p style={{ color: 'var(--text-muted)' }}>Interact with environmental variables to preview the automated claims engine in real-time.</p>
            
            <div className="sim-buttons">
              <button 
                onClick={() => calculateClaim('normal')} 
                className={`btn btn-sim ${simulation.state === 'normal' ? 'active' : ''}`}
                disabled={isLoading}
              >
                Normal Day
              </button>
              <button 
                onClick={() => calculateClaim('rain')} 
                className={`btn btn-sim ${simulation.state === 'rain' ? 'active' : ''}`}
                disabled={isLoading}
              >
                <CloudRain size={16} /> Rain + Drop
              </button>
              <button 
                onClick={() => calculateClaim('fraud')} 
                className={`btn btn-sim ${simulation.state === 'fraud' ? 'active' : ''}`}
                disabled={isLoading}
              >
                <ShieldAlert size={16} /> Trigger Fraud
              </button>
            </div>

            {isLoading && (
              <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--primary)' }}>
                Processing parametric inputs...
              </div>
            )}

            {claim && !isLoading && claim.decision !== 'NO_LOSS' && (
              <div className={`card claim-result ${claim.decision.toLowerCase()}`} style={{ marginTop: '2rem', marginBottom: 0 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Automated Claim Decision</h3>
                
                {claim.decision === 'APPROVED' && (
                  <div className="status-badge-lg approved-text">
                    <CheckCircle size={20} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }}/> APPROVED
                  </div>
                )}
                {claim.decision === 'VERIFICATION' && (
                  <div className="status-badge-lg verification-text">
                    <AlertCircle size={20} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }}/> UNDER MANUAL REVIEW
                  </div>
                )}
                {claim.decision === 'REJECTED' && (
                  <div className="status-badge-lg rejected-text">
                    <XCircle size={20} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '8px' }}/> REJECTED (FRAUD MARKED)
                  </div>
                )}
                
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Automated Payout:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, marginLeft: '1rem' }}>₹{claim.payout}</span>
                </div>
              </div>
            )}
            
            {claim && !isLoading && claim.decision === 'NO_LOSS' && (
              <div className="card" style={{ marginTop: '2rem', marginBottom: 0, textAlign: 'center', borderColor: 'var(--card-border)' }}>
                <p>Demand is stable. No parametric claim triggered.</p>
              </div>
            )}
          </div>

          {/* Insights / Fraud Panel */}
          <div className="card">
            <h2>Fraud Detection Engine</h2>
            
            {!claim ? (
              <p style={{ color: 'var(--text-muted)' }}>Waiting for event parameters to establish baseline confidence.</p>
            ) : claim.reasons.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No notable anomalies. Operations normal.</p>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Real-time indicators:</p>
                {claim.reasons.map((reason, idx) => (
                  <div key={idx} className="insight-item">
                    <div className={`insight-icon ${reason.type === 'danger' ? 'red' : reason.type === 'success' ? 'green' : 'blue'}`}></div>
                    <span style={{ fontSize: '0.95rem' }}>{reason.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ai-box">
              <Cpu className="ai-icon" size={24} />
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0' }}>AI Suggestion</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {(!claim || claim.decision === 'NO_LOSS') 
                    ? "Conditions are favorable for maximum earnings today. Maintain safe speeds."
                    : claim.decision === 'APPROVED' 
                    ? "Severe weather detected. Income loss covered. Rest safely."
                    : "High-risk anomalies flagged. Further claims require manual verification."}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
