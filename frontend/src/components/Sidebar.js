import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-Based Navigation Configuration
  const citizenNavItems = [
    { path: '/dashboard', label: 'Public Weather Portal', icon: '🏠' },
    { path: '/citizen-report', label: 'Submit Incident Report', icon: '📢', highlight: true },
    { path: '/my-reports', label: 'My Submissions Track', icon: '📋' },
    { path: '/map', label: 'Public Hazard Map', icon: '🗺️' },
    { path: '/events', label: 'Official Bulletins', icon: '⚡' },
    { path: '/safety-guidelines', label: 'Emergency Helplines', icon: '🛡️' },
  ];

  const adminNavItems = [
    { path: '/dashboard', label: 'Operations Console', icon: '📊' },
    { path: '/admin', label: 'Disaster Governance', icon: '🛡️', highlight: true },
    { path: '/events', label: 'Incidents Registry', icon: '⚡' },
    { path: '/map', label: 'GIS Command Map', icon: '🗺️' },
    { path: '/data-sources', label: 'Data Sources (6)', icon: '📡' },
    { path: '/ai-intelligence', label: 'AI Intelligence Engine', icon: '🤖' },
    { path: '/analytics', label: 'Big Data Analytics', icon: '📈' },
  ];

  const navItems = isAdmin ? adminNavItems : citizenNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        />
      )}

      <aside
        style={{
          width: isCollapsed ? '78px' : '260px',
          backgroundColor: 'var(--sidebar-header)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: '0 2px 8px rgba(232, 100, 12, 0.4)',
              }}
            >
              🌦️
            </div>
            {!isCollapsed && (
              <div>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  WeatherSense
                </h1>
                <span style={{ fontSize: '0.7rem', color: isAdmin ? '#FDBA74' : '#CBD5E1', fontWeight: 700, letterSpacing: '0.03em' }}>
                  {isAdmin ? '🛡️ IMD Officer Command' : '🇮🇳 Citizen Weather Portal'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '12px 0' : '10px 14px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                color: isActive ? '#FFFFFF' : item.highlight ? '#FDBA74' : '#CBD5E1',
                backgroundColor: isActive
                  ? 'var(--primary-accent)'
                  : item.highlight
                  ? 'rgba(232, 100, 12, 0.16)'
                  : 'transparent',
                border: item.highlight && !isActive ? '1px dashed rgba(232, 100, 12, 0.5)' : '1px solid transparent',
                fontWeight: isActive || item.highlight ? 700 : 500,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              })}
              title={isCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '1.15rem', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile & Toggle */}
        <div
          style={{
            padding: '14px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {isAuthenticated && user && !isCollapsed && (
            <div
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isAdmin ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: isAdmin ? '#FCA5A5' : '#86EFAC', textTransform: 'capitalize', fontWeight: 600 }}>
                  {isAdmin ? '🛡️ IMD Officer' : '👤 Citizen User'}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={onToggleCollapse}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'transparent',
                color: '#CBD5E1',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? '▶' : '◀ Collapse'}
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#FCA5A5',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
                title="Logout"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
