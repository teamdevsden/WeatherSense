import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import VerificationBadge from './VerificationBadge';
import { getSourceMeta } from '../utils/indianCities';

const WeatherEventCard = ({ event, onVerify, onMarkFake, onDelete, isAdmin = false, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const sourceInfo = getSourceMeta(event.source);
  const formattedDate = event.timestamp ? format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a') : 'Just now';
  const confidencePct = Math.round((event.mlConfidenceScore || 0.85) * 100);
  const isFake = event.isFake || event.verificationStatus === 'fake' || event.verificationStatus === 'misleading';

  // Determine Severity level
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

  return (
    <div
      className="ws-card ws-card-hover"
      style={{
        padding: compact ? '14px 16px' : '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        borderLeft: `5px solid ${isFake ? '#EF4444' : event.verificationStatus === 'verified' ? '#10B981' : severity.color}`,
      }}
    >
      {/* Header: Source, Event Type, Verification Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin ? (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: sourceInfo.bg,
                color: sourceInfo.color,
                border: `1px solid ${sourceInfo.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{sourceInfo.icon}</span>
              <span>{sourceInfo.shortName}</span>
              {sourceInfo.isSimulated && <span style={{ opacity: 0.8 }}>({sourceInfo.tag})</span>}
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: severity.bg,
                color: severity.color,
                border: `1px solid ${severity.border}`,
              }}
            >
              {severity.label}
            </span>
          )}
          <EventTypeBadge type={event.eventType} size="small" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isAdmin ? (
            <VerificationBadge status={event.verificationStatus} size="small" />
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#065F46',
                backgroundColor: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #A7F3D0',
              }}
            >
              ✓ Official Bulletin
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Location */}
      <div>
        <h4
          onClick={() => navigate(`/events/${event._id}`)}
          style={{
            fontSize: compact ? '0.95rem' : '1.05rem',
            fontWeight: 700,
            color: '#1F2937',
            lineHeight: 1.35,
            marginBottom: '4px',
            cursor: 'pointer',
          }}
        >
          {event.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem', color: '#64748B', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {event.city}, {event.state} Division
          </span>
          <span>•</span>
          <span>🕒 {formattedDate}</span>
          {isAdmin && event.reportCount > 1 && (
            <>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>
                👥 {event.reportCount} Reports Clustered
              </span>
            </>
          )}
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
          backgroundColor: '#F8FAFC',
          padding: '8px 12px',
          borderRadius: '8px',
          margin: 0,
        }}
        title="Click to expand/collapse"
      >
        {event.description}
      </p>

      {/* Action and Info Strip */}
      {isAdmin ? (
        /* Admin Intelligence Strip */
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            backgroundColor: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748B', fontWeight: 600 }}>AI Authenticity Score:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '50px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${confidencePct}%`,
                    height: '100%',
                    backgroundColor: confidencePct >= 75 ? '#10B981' : confidencePct >= 50 ? '#F59E0B' : '#EF4444',
                    borderRadius: '3px',
                  }}
                />
              </div>
              <strong style={{ color: confidencePct >= 75 ? '#059669' : confidencePct >= 50 ? '#D97706' : '#DC2626' }}>
                {confidencePct}%
              </strong>
            </div>
          </div>

          <Link
            to={`/events/${event._id}`}
            style={{
              color: 'var(--primary-accent)',
              fontWeight: 700,
              fontSize: '0.78rem',
              textDecoration: 'none',
            }}
          >
            View Full Intelligence Dossier ➔
          </Link>
        </div>
      ) : (
        /* Citizen Safety Action Strip */
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            backgroundColor: '#F8FAFC',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
            <span style={{ color: '#DC2626', fontWeight: 700 }}>🚨 Emergency Helpline: 112 / 1078</span>
          </div>

          <Link
            to={`/events/${event._id}`}
            style={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            📢 View Safety Advisory Details ➔
          </Link>
        </div>
      )}

      {/* Admin Moderation Actions */}
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
          {!isFake && (
            <button
              type="button"
              onClick={() => onMarkFake && onMarkFake(event._id)}
              className="btn-danger"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              ✕ Mark Misleading
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
