import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';

const Navbar = ({ onOpenMobileMenu }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, refreshData } = useWeather();
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Left: Mobile hamburger + MoES / IMD Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!isPublicPage && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="btn-secondary"
              style={{ padding: '6px 10px', display: 'none' }}
              id="mobile-menu-btn"
            >
              ☰
            </button>
          )}

          <div
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                backgroundColor: 'var(--sidebar-header)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 2px 6px rgba(27, 42, 74, 0.25)',
              }}
            >
              🌦️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', letterSpacing: '-0.02em' }}>
                  WeatherSense <span style={{ color: 'var(--primary-accent)' }}>India</span>
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE',
                  }}
                >
                  IMD • MoES
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                National Weather Intelligence Platform
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time status, Clock, Refresh button, User Badge / Login CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Live Node Stream Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#4B5563',
              backgroundColor: '#F8FAFC',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
            }}
          >
            <span className={isConnected ? 'pulse-green' : 'pulse-dot'} />
            <span style={{ fontWeight: 600 }}>{isConnected ? 'IMD Grid Online' : 'Connecting Grid'}</span>
          </div>

          {/* Clock */}
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#1F2937',
              fontFamily: 'monospace',
              display: 'none',
            }}
            className="desktop-clock"
          >
            {format(time, 'dd MMM yyyy • HH:mm:ss')} IST
          </div>

          {/* Refresh Action */}
          {!isPublicPage && (
            <button
              type="button"
              onClick={handleRefresh}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                gap: '6px',
              }}
              title="Refresh Analytics & Sensor Cache"
            >
              <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }}>
                🔄
              </span>
              <span>Sync</span>
            </button>
          )}

          {/* User badge or Login action */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>👤</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1F2937' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: user?.role === 'admin' ? '#FEE2E2' : '#E0E7FF',
                    color: user?.role === 'admin' ? '#DC2626' : '#4338CA',
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#EF4444' }}
                title="Log Out"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary"
              style={{ padding: '7px 18px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              🔐 Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
