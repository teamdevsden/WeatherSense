import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import VerificationBadge from './VerificationBadge';
import { useWeather } from '../context/WeatherContext';
import { getSourceMeta } from '../utils/indianCities';

const RealTimeFeed = ({ maxHeight = '540px' }) => {
  const { liveFeed, isConnected } = useWeather();
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const displayFeed = isPaused ? liveFeed.slice(0, 15) : liveFeed.slice(0, 25);

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
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>
              Live Weather Intelligence Stream
            </h4>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Multi-source automated stream ({displayFeed.length} buffered)
            </span>
          </div>
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
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
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
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94A3B8' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📡</span>
            <p style={{ fontSize: '0.875rem' }}>Ingesting multi-source weather telemetry & social media firehose...</p>
          </div>
        ) : (
          displayFeed.map((ev, index) => {
            const src = getSourceMeta(ev.source);
            const timeStr = ev.timestamp ? format(new Date(ev.timestamp), 'hh:mm:ss a') : 'Just now';
            const confidence = Math.round((ev.mlConfidenceScore || 0.85) * 100);
            const isFake = ev.isFake || ev.verificationStatus === 'fake' || ev.verificationStatus === 'misleading';

            return (
              <div
                key={ev._id || `${ev.city}-${index}`}
                onClick={() => ev._id && !ev._id.toString().startsWith('live-') && navigate(`/events/${ev._id}`)}
                className={index === 0 ? 'slide-in-item' : ''}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  borderLeft: `4px solid ${isFake ? '#EF4444' : ev.verificationStatus === 'verified' ? '#10B981' : '#E8640C'}`,
                  cursor: ev._id ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Top: Source & Hazard & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: src.bg,
                        color: src.color,
                        border: `1px solid ${src.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title={src.name}
                    >
                      <span>{src.icon}</span>
                      <span>{src.shortName}</span>
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1F2937' }}>{ev.city}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({ev.state})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <EventTypeBadge type={ev.eventType} size="small" />
                    <VerificationBadge status={ev.verificationStatus} size="small" />
                  </div>
                </div>

                {/* Title */}
                <p
                  style={{
                    fontSize: '0.825rem',
                    color: '#334155',
                    fontWeight: 600,
                    marginBottom: '6px',
                    lineHeight: 1.35,
                  }}
                >
                  {ev.title}
                </p>

                {/* Hashtags Strip */}
                {ev.hashtags && ev.hashtags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {ev.hashtags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          color: '#2563EB',
                          backgroundColor: '#EFF6FF',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {ev.isDuplicate && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: '#D97706',
                          backgroundColor: '#FFFBEB',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        🔗 Duplicate Clustered
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Timestamp & AI Score */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.725rem',
                    color: '#94A3B8',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '6px',
                  }}
                >
                  <span>🕒 {timeStr}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>AI Authenticity:</span>
                    <strong style={{ color: confidence >= 75 ? '#059669' : confidence >= 50 ? '#D97706' : '#DC2626' }}>
                      {confidence}%
                    </strong>
                  </div>
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
