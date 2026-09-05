import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, true);
    setIsLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/citizen-report');
      }
    }
  };

  const handleQuickLoginClick = async (role) => {
    setIsLoading(true);
    const targetEmail = role === 'admin' ? 'admin@imd.gov.in' : 'citizen@demo.com';
    const targetPassword = role === 'admin' ? 'admin123' : 'citizen123';
    setEmail(targetEmail);
    setPassword(targetPassword);

    const result = await quickLogin(role, true);
    setIsLoading(false);

    if (result.success) {
      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/citizen-report');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className="ws-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px 32px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Branding & Emblems */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'var(--sidebar-header)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(27, 42, 74, 0.25)',
            }}
          >
            🌦️
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#1E3A8A',
              backgroundColor: '#EFF6FF',
              padding: '2px 10px',
              borderRadius: '20px',
              border: '1px solid #DBEAFE',
              marginBottom: '6px',
            }}
          >
            <span>🇮🇳 Ministry of Earth Sciences • IMD Portal</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B2A4A', letterSpacing: '-0.02em' }}>
            WeatherSense <span style={{ color: 'var(--primary-accent)' }}>India</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Sign in to access real-time weather intelligence & GIS operations
          </p>
        </div>

        {/* 2 Prominent Demo Credential Boxes with Quick Login */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ 1-Click Instant Demo Access
          </div>

          {/* Box 1: Admin */}
          <div
            className="quick-login-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#FFF7ED',
              borderColor: '#FED7AA',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>🛡️</span>
                <strong style={{ fontSize: '0.875rem', color: '#9A3412' }}>IMD Administrator</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#C2410C', fontFamily: 'monospace' }}>
                admin@imd.gov.in / admin123
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickLoginClick('admin')}
              disabled={isLoading}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                backgroundColor: '#E8640C',
              }}
            >
              Quick Login ▶
            </button>
          </div>

          {/* Box 2: Citizen */}
          <div
            className="quick-login-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#EFF6FF',
              borderColor: '#BFDBFE',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>👤</span>
                <strong style={{ fontSize: '0.875rem', color: '#1E40AF' }}>Test Citizen Officer</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1D4ED8', fontFamily: 'monospace' }}>
                citizen@demo.com / citizen123
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickLoginClick('citizen')}
              disabled={isLoading}
              className="btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                backgroundColor: '#2563EB',
              }}
            >
              Quick Login ▶
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>OR ENTER CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Official Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@imd.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: 'none', background: 'none', fontSize: '0.75rem', color: '#64748B', cursor: 'pointer' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-navy"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '8px',
              marginTop: '8px',
            }}
          >
            {isLoading ? 'Authenticating with IMD Central Node...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
