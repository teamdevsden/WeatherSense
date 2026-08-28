import React, { useState } from 'react';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import VerificationBadge from './VerificationBadge';

const SOURCE_META = {
  twitter: { name: 'X / Twitter', icon: '🐦', color: '#1DA1F2', bg: '#EFF8FF' },
  imd_api: { name: 'IMD API', icon: '📡', color: '#E8640C', bg: '#FFF7ED' },
  openweather: { name: 'OpenWeather', icon: '🛰️', color: '#10B981', bg: '#ECFDF5' },
  citizen: { name: 'Citizen Report', icon: '👤', color: '#8B5CF6', bg: '#F5F3FF' },
};

const WeatherEventCard = ({ event, onVerify, onMarkFake, onDelete, isAdmin = false, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sourceInfo = SOURCE_META[event.source] || SOURCE_META.imd_api;
  const formattedDate = event.timestamp ? format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a') : 'Just now';
  const confidencePct = Math.round((event.mlConfidenceScore || 0.85) * 100);

  // Determine Severity level for citizen safety view
  const getSeverityBadge = () => {
    if (event.eventType === 'flooding' || event.eventType === 'thunderstorm') {
      return { label: '🔴 RED ALERT — SEVERE WARNING', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
    }
    if (event.eventType === 'rainfall' || event.eventType === 'heatwave') {
      return { label: '🟠 ORANGE ALERT — HIGH ADVISORY', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' };
    }
    return { label: '🟡 YELLOW WATCH — ACTIVE ADVISORY', color: '#D97706', bg: '#FEFCE8', border: '#FEF08A' };
  };

  const severity = getSeverityBadge();

  // 1. PUBLIC / CITIZEN VIEW: Clean, Actionable Weather Alert Card
  if (!isAdmin) {
    return (
      <div
        className="ws-card ws-card-hover"
        style={{
          padding: compact ? '16px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          borderLeft: `5px solid ${severity.color}`,
          border: '1px solid #E2E8F0',
          borderLeftWidth: '5px',
          borderLeftColor: severity.color,
        }}
      >
        {/* Severity Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '6px',
              backgroundColor: severity.bg,
              color: severity.color,
              border: `1px solid ${severity.border}`,
              letterSpacing: '0.03em',
            }}
          >
            {severity.label}
          </span>
          <EventTypeBadge type={event.eventType} size="small" />
        </div>

        {/* Title & Region */}
        <div>
          <h4
            style={{
              fontSize: compact ? '0.975rem' : '1.1rem',
              fontWeight: 700,
              color: '#1B2A4A',
              lineHeight: 1.35,
              marginBottom: '6px',
            }}
          >
            {event.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#64748B', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 {event.city}, {event.state} Division
            </span>
            <span>•</span>
            <span>🕒 Updated: {formattedDate}</span>
          </div>
        </div>

        {/* Description & Impact Summary */}
        <p
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            fontSize: '0.875rem',
            color: '#334155',
            lineHeight: 1.5,
            cursor: 'pointer',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            backgroundColor: '#F8FAFC',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #F1F5F9',
            margin: 0,
          }}
          title="Click to expand/collapse"
        >
          {event.description}
        </p>

        {/* Citizen Safety Advisory Guidance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            color: '#065F46',
            backgroundColor: '#ECFDF5',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #A7F3D0',
          }}
        >
          <span>🛡️</span>
          <span style={{ fontWeight: 600 }}>
            Official IMD Advisory: Stay alert, monitor local transport updates, and avoid waterlogged areas.
          </span>
        </div>
      </div>
    );
  }

  // 2. ADMIN VIEW: Full Incident Moderation & Data Pipeline Telemetry
  return (
    <div
      className="ws-card ws-card-hover"
      style={{
        padding: compact ? '14px 16px' : '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderLeft: `4px solid ${event.isFake ? '#EF4444' : event.verificationStatus === 'verified' ? '#10B981' : '#F59E0B'}`,
      }}
    >
      {/* Header: Source, Event Type, Verification Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: sourceInfo.bg,
              color: sourceInfo.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{sourceInfo.icon}</span>
            <span>{sourceInfo.name}</span>
          </span>
          <EventTypeBadge type={event.eventType} size="small" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <VerificationBadge status={event.verificationStatus} size="small" />
        </div>
      </div>

      {/* Main Title & Location */}
      <div>
        <h4
          style={{
            fontSize: compact ? '0.95rem' : '1.05rem',
            fontWeight: 700,
            color: '#1F2937',
            lineHeight: 1.35,
            marginBottom: '4px',
          }}
        >
          {event.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#64748B', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {event.city}, {event.state}
          </span>
          <span>•</span>
          <span>🕒 {formattedDate}</span>
        </div>
      </div>

      {/* Description */}
      <p
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          fontSize: '0.875rem',
          color: '#4B5563',
          lineHeight: 1.5,
          cursor: 'pointer',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : 2,
          WebkitBoxOrient: 'vertical',
        }}
        title="Click to expand/collapse"
      >
        {event.description}
      </p>

      {/* Confidence & Coordinates Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          backgroundColor: '#F8FAFC',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#64748B', fontWeight: 500 }}>AI NLP Score:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '60px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${confidencePct}%`,
                  height: '100%',
                  backgroundColor: confidencePct >= 75 ? '#10B981' : confidencePct >= 50 ? '#F59E0B' : '#EF4444',
                  borderRadius: '3px',
                }}
              />
            </div>
            <span style={{ fontWeight: 700, color: confidencePct >= 75 ? '#059669' : confidencePct >= 50 ? '#D97706' : '#DC2626' }}>
              {confidencePct}%
            </span>
          </div>
        </div>

        {event.location?.coordinates && (
          <span style={{ color: '#64748B', fontFamily: 'monospace' }}>
            [{event.location.coordinates[1].toFixed(2)}°N, {event.location.coordinates[0].toFixed(2)}°E]
          </span>
        )}
      </div>

      {/* Hashtags */}
      {event.hashtags && event.hashtags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {event.hashtags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.725rem',
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Admin Verification Actions */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
          {event.verificationStatus !== 'verified' && (
            <button
              type="button"
              onClick={() => onVerify && onVerify(event._id)}
              className="btn-success"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              ✓ Verify Event
            </button>
          )}
          {!event.isFake && (
            <button
              type="button"
              onClick={() => onMarkFake && onMarkFake(event._id)}
              className="btn-danger"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              ✕ Mark Fake
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete && onDelete(event._id)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#EF4444' }}
            title="Delete Incident Record"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherEventCard;
