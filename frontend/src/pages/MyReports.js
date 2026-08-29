import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import EventTypeBadge from '../components/EventTypeBadge';
import VerificationBadge from '../components/VerificationBadge';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/my-reports');
      if (res.data && res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      toast.error('Failed to load your submitted reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>📋</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B2A4A' }}>
              My Submitted Weather Reports
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Track real-time official verification, ground reality confirmation, and disaster broadcast status for your contributions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/citizen-report')}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
        >
          ➕ Submit New Report
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading your submissions history...</p>
        </div>
      ) : reports.length === 0 ? (
        <div
          className="ws-card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px dashed #CBD5E1',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📢</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>No Reports Submitted Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '6px auto 20px auto' }}>
            When you report extreme weather (rain, flood, heatwave) from your area, it will appear here with live official status tracking.
          </p>
          <button
            type="button"
            onClick={() => navigate('/citizen-report')}
            className="btn-primary"
            style={{ padding: '10px 24px' }}
          >
            🚀 Submit Your First Weather Report
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reports.map((rep) => {
            const code = rep.reportCode || `WS-${rep._id.toString().slice(-5).toUpperCase()}`;
            const timeStr = rep.submittedAt ? format(new Date(rep.submittedAt), 'dd MMM yyyy, hh:mm a') : 'Recently';
            const status = rep.verificationStatus || rep.weatherEventId?.verificationStatus || 'pending';

            return (
              <div
                key={rep._id}
                className="ws-card ws-card-hover"
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${status === 'verified' ? '#10B981' : status === 'fake' ? '#EF4444' : '#F59E0B'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#1E3A8A',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ID: #{code}
                    </span>
                    <EventTypeBadge type={rep.eventType} size="small" />
                    <VerificationBadge status={status} size="small" />
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Submitted: <strong>{timeStr}</strong>
                  </div>
                </div>

                {/* Location & Details */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937', marginBottom: '4px' }}>
                    📍 {rep.city}, {rep.state}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {rep.description}
                  </p>
                </div>

                {/* Verification Status Banner and Link */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#F8FAFC',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.78rem',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {status === 'verified' ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        ✓ Verified & Dispatched to National Disaster Network
                      </span>
                    ) : status === 'fake' || status === 'misleading' ? (
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>
                        ✕ Flagged as Inaccurate / Suppressed
                      </span>
                    ) : (
                      <span style={{ color: '#D97706', fontWeight: 700 }}>
                        ⏳ Under Review by District Disaster Cell
                      </span>
                    )}
                  </div>

                  {rep.weatherEventId && (
                    <Link
                      to={`/events/${rep.weatherEventId._id || rep.weatherEventId}`}
                      style={{
                        color: '#2563EB',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      View Safety Advisory ➔
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReports;
