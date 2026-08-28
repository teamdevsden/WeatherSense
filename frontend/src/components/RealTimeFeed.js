import React, { useState } from 'react';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import { useWeather } from '../context/WeatherContext';

const SOURCE_ICONS = {
  twitter: { icon: '🐦', name: 'X / Twitter' },
  imd_api: { icon: '📡', name: 'IMD Doppler' },
  openweather: { icon: '🛰️', name: 'OpenWeather' },
  citizen: { icon: '👤', name: 'Citizen Report' },
};

const RealTimeFeed = ({ maxHeight = '460px' }) => {
  const { liveFeed, isConnected } = useWeather();
  const [isPaused, setIsPaused] = useState(false);

  const displayFeed = isPaused ? liveFeed.slice(0, 15) : liveFeed.slice(0, 20);

  return (
    <div
      className="ws-card"
      style={{
        height: maxHeight,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={isConnected ? 'pulse-green' : 'pulse-dot'} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A', margin: 0 }}>
            Live Weather Alerts ({displayFeed.length})
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: isPaused ? '#FFF7ED' : '#FFFFFF',
              color: isPaused ? '#E8640C' : '#475569',
              cursor: 'pointer',
            }}
          >
            {isPaused ? '▶️ Resume Stream' : '⏸️ Pause Feed'}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {displayFeed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📡</span>
            <p style={{ fontSize: '0.875rem' }}>Awaiting live sensor & social media streams...</p>
          </div>
        ) : (
          displayFeed.map((ev, index) => {
            const src = SOURCE_ICONS[ev.source] || SOURCE_ICONS.imd_api;
            const timeStr = ev.timestamp ? format(new Date(ev.timestamp), 'hh:mm:ss a') : 'Just now';
            const confidence = Math.round((ev.mlConfidenceScore || 0.85) * 100);

            return (
              <div
                key={ev._id || `${ev.city}-${index}`}
                className={index === 0 ? 'slide-in-item' : ''}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  borderLeft: `3px solid ${ev.isFake ? '#EF4444' : '#E8640C'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem' }} title={src.name}>
                      {src.icon}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F2937' }}>{ev.city}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({ev.state})</span>
                  </div>
                  <EventTypeBadge type={ev.eventType} size="small" />
                </div>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#4B5563',
                    marginBottom: '6px',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ev.title}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.725rem',
                    color: '#94A3B8',
                  }}
                >
                  <span>🕒 {timeStr}</span>
                  <span style={{ fontWeight: 600, color: confidence >= 70 ? '#059669' : '#D97706' }}>
                    AI Score: {confidence}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RealTimeFeed;
