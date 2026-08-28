import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 900,
          color: '#CBD5E1',
          lineHeight: 1,
          marginBottom: '10px',
          fontFamily: 'monospace',
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1B2A4A', marginBottom: '8px' }}>
        Weather Grid Sector Not Found
      </h2>
      <p style={{ color: '#64748B', maxWidth: '480px', marginBottom: '24px', fontSize: '0.95rem' }}>
        The requested telemetry endpoint or route is unavailable or does not exist in the IMD WeatherSense routing table.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary">
          📊 Go to Dashboard
        </button>
        <button type="button" onClick={() => navigate('/')} className="btn-secondary">
          🏠 Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
