import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import EventTypeBadge from '../components/EventTypeBadge';
import VerificationBadge from '../components/VerificationBadge';
import { EVENT_TYPES_CONFIG, getSourceMeta } from '../utils/indianCities';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const { stats, refreshData } = useWeather();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'users' | 'sources'
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [sourcesHealth, setSourcesHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending events
  const fetchPendingEvents = useCallback(async () => {
    try {
      const res = await api.get('/events?status=pending&limit=50');
      if (res.data && res.data.success) {
        setPendingEvents(res.data.events);
      }
    } catch (err) {
      toast.error('Failed to load pending moderation events');
    }
  }, []);

  // Fetch all events
  const fetchAllEvents = useCallback(async () => {
    try {
      const res = await api.get('/events?limit=40');
      if (res.data && res.data.success) {
        setAllEvents(res.data.events);
      }
    } catch (err) {
      toast.error('Failed to load events repository');
    }
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data && res.data.success) {
        setUsersList(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to retrieve user registry');
    }
  }, []);

  // Fetch source health telemetry
  const fetchSourceHealth = useCallback(async () => {
    try {
      const res = await api.get('/admin/source-health');
      if (res.data && res.data.success) {
        setSourcesHealth(res.data.sources || []);
      }
    } catch (err) {
      toast.error('Failed to retrieve source health metrics');
    }
  }, []);

  useEffect(() => {
    const loadTabData = async () => {
      setLoading(true);
      if (activeTab === 'pending') await fetchPendingEvents();
      else if (activeTab === 'all') await fetchAllEvents();
      else if (activeTab === 'users') await fetchUsers();
      else if (activeTab === 'sources') await fetchSourceHealth();
      setLoading(false);
    };
    loadTabData();
  }, [activeTab, fetchPendingEvents, fetchAllEvents, fetchUsers, fetchSourceHealth]);

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/verify/${id}`, { status: 'verified' });
      toast.success('Incident verified & broadcasted to National Grid');
      fetchPendingEvents();
      fetchAllEvents();
      refreshData();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handleMarkFake = async (id) => {
    try {
      await api.put(`/admin/verify/${id}`, { status: 'fake' });
      toast.error('Incident flagged as Misinformation & suppressed');
      fetchPendingEvents();
      fetchAllEvents();
      refreshData();
    } catch (err) {
      toast.error('Failed to flag event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this event?')) {
      try {
        await api.delete(`/admin/events/${id}`);
        toast.success('Incident deleted from registry');
        fetchPendingEvents();
        fetchAllEvents();
        refreshData();
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleCategoryReassign = async (id, newCategory) => {
    try {
      await api.put(`/admin/events/${id}/category`, { eventType: newCategory });
      toast.success(`Category reassigned to ${newCategory.toUpperCase()}`);
      fetchPendingEvents();
      fetchAllEvents();
      refreshData();
    } catch (err) {
      toast.error('Category update failed');
    }
  };

  const handleToggleBanUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      if (res.data && res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user ban state');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Summary KPI Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2A4A' }}>
              IMD Disaster Governance & Moderation Console
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Authorized Administrator: <strong>{user?.name}</strong> • Level 1 Incident Dispatch & Explainable AI Verification
          </p>
        </div>

        {/* Top summary KPI pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '8px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#B45309' }}>{stats.pendingCount || pendingEvents.length || 0}</div>
          </div>
          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '8px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Verified Total</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>{stats.verifiedCount || 52}</div>
          </div>
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Fake Suppressed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B' }}>{stats.fakeCount || 7}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #E2E8F0',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '0 16px',
          borderRadius: '10px 10px 0 0',
        }}
      >
        {[
          { key: 'pending', label: 'Pending Verification', icon: '⏳', count: pendingEvents.length },
          { key: 'all', label: 'All Incidents Registry', icon: '📁' },
          { key: 'users', label: 'User & Officer Management', icon: '👥' },
          { key: 'sources', label: 'Data Ingestion Health', icon: '📡' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '14px 18px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary-accent)' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? 'var(--primary-accent)' : '#64748B',
              fontWeight: activeTab === tab.key ? 700 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                style={{
                  backgroundColor: '#E8640C',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Pending Verification */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>Loading pending events...</div>
          ) : pendingEvents.length === 0 ? (
            <div className="ws-card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🎉</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>Inbox Zero: All Incidents Moderated</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                There are no unverified crowdsourced or sensor alerts currently pending action.
              </p>
            </div>
          ) : (
            pendingEvents.map((ev) => {
              const src = getSourceMeta(ev.source);
              const factors = ev.verificationFactors || {
                sourceReliability: 75,
                locationConsistency: 85,
                weatherConsistency: 80,
                contentAnalysis: 85,
                duplicateSimilarity: 70,
              };

              return (
                <div
                  key={ev._id}
                  className="ws-card"
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderLeft: '4px solid #F59E0B',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: src.bg,
                            color: src.color,
                            border: `1px solid ${src.border}`,
                          }}
                        >
                          {src.icon} {src.name} {src.isSimulated ? '(Demo)' : ''}
                        </span>
                        <EventTypeBadge type={ev.eventType} size="small" />
                        <VerificationBadge status={ev.verificationStatus} size="small" />
                        {ev.isDuplicate && (
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#FFFBEB', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            ⚠️ Duplicate Warning ({ev.reportCount || 2} reports merged)
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F2937' }}>{ev.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        📍 <strong>{ev.city}</strong>, {ev.state} • 🕒 {format(new Date(ev.timestamp), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    </div>

                    {/* AI Confidence Meter */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>AI Authenticity Score</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: (ev.mlConfidenceScore || 0.8) >= 0.7 ? '#059669' : '#D97706' }}>
                        {Math.round((ev.mlConfidenceScore || 0.8) * 100)}%
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.885rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>{ev.description}</p>

                  {/* Explainable AI Verification Factors Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                      backgroundColor: '#F8FAFC',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748B' }}>Source Reliability:</span>
                      <strong style={{ display: 'block', color: '#1F2937' }}>{factors.sourceReliability}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Location Consistency:</span>
                      <strong style={{ display: 'block', color: '#1F2937' }}>{factors.locationConsistency}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Weather Consistency:</span>
                      <strong style={{ display: 'block', color: '#1F2937' }}>{factors.weatherConsistency}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Content NLP:</span>
                      <strong style={{ display: 'block', color: '#1F2937' }}>{factors.contentAnalysis}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Corroboration:</span>
                      <strong style={{ display: 'block', color: '#1F2937' }}>{factors.duplicateSimilarity}%</strong>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    {/* Category Reassign Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Reassign Category:</span>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                        value={ev.eventType}
                        onChange={(e) => handleCategoryReassign(ev._id, e.target.value)}
                      >
                        {EVENT_TYPES_CONFIG.map((cfg) => (
                          <option key={cfg.key} value={cfg.key}>
                            {cfg.icon} {cfg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/events/${ev._id}`}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        📄 Dossier
                      </Link>
                      <button type="button" onClick={() => handleVerify(ev._id)} className="btn-success">
                        ✅ Approve & Verify
                      </button>
                      <button type="button" onClick={() => handleMarkFake(ev._id)} className="btn-danger">
                        ❌ Mark Misleading
                      </button>
                      <button type="button" onClick={() => handleDelete(ev._id)} className="btn-secondary" style={{ color: '#EF4444' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: All Incidents Registry */}
      {activeTab === 'all' && (
        <div className="ws-card" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Title & Location</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Hazard</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Source</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Confidence</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.map((ev) => (
                  <tr key={ev._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/events/${ev._id}`} style={{ fontWeight: 600, color: '#1F2937', textDecoration: 'none' }}>
                        {ev.title}
                      </Link>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        📍 {ev.city}, {ev.state} • {format(new Date(ev.timestamp), 'dd MMM, hh:mm a')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <EventTypeBadge type={ev.eventType} size="small" />
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                      {ev.source}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <VerificationBadge status={ev.verificationStatus} size="small" />
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: (ev.mlConfidenceScore || 0.85) >= 0.75 ? '#059669' : '#DC2626' }}>
                      {Math.round((ev.mlConfidenceScore || 0.85) * 100)}%
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to={`/events/${ev._id}`} className="btn-secondary" style={{ padding: '4px 6px', fontSize: '0.72rem', textDecoration: 'none' }}>
                          📄
                        </Link>
                        {ev.verificationStatus !== 'verified' && (
                          <button onClick={() => handleVerify(ev._id)} className="btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            ✓
                          </button>
                        )}
                        {ev.verificationStatus !== 'fake' && ev.verificationStatus !== 'misleading' && (
                          <button onClick={() => handleMarkFake(ev._id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            ✕
                          </button>
                        )}
                        <button onClick={() => handleDelete(ev._id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#EF4444' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="ws-card" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>User / Officer</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Email Address</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Account Status</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: u.role === 'admin' ? '#FEE2E2' : '#E0E7FF',
                          color: u.role === 'admin' ? '#DC2626' : '#4338CA',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.isBanned ? (
                        <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.8rem' }}>⛔ Suspended / Banned</span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem' }}>🟢 Active</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '0.8rem' }}>
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u._id !== user?.id && u._id !== user?._id && (
                        <button
                          type="button"
                          onClick={() => handleToggleBanUser(u._id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: u.isBanned ? '#10B981' : '#EF4444',
                            backgroundColor: u.isBanned ? '#ECFDF5' : '#FEF2F2',
                            color: u.isBanned ? '#059669' : '#DC2626',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          {u.isBanned ? '🔓 Restore Access' : '⛔ Ban / Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Sources Health */}
      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {sourcesHealth.map((src) => (
            <div key={src.id} className="ws-card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={src.isSimulated ? 'pulse-dot' : 'pulse-green'} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A' }}>{src.name}</h4>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: src.isSimulated ? '#FFFBEB' : '#ECFDF5',
                    color: src.isSimulated ? '#B45309' : '#059669',
                    border: `1px solid ${src.isSimulated ? '#FDE68A' : '#A7F3D0'}`,
                  }}
                >
                  {src.isSimulated ? 'DEMO STREAM' : 'ONLINE'}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px' }}>
                {src.type} • Protocol: <code style={{ color: '#1E3A8A' }}>{src.protocol}</code>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Round-Trip Ping:</span>
                  <div style={{ fontWeight: 700, color: '#1F2937' }}>{src.pingMs} ms</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Uptime 30d:</span>
                  <div style={{ fontWeight: 700, color: '#059669' }}>{src.uptime}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Events Ingested:</span>
                  <div style={{ fontWeight: 700, color: '#1F2937' }}>{src.eventsIngested}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Error Rate:</span>
                  <div style={{ fontWeight: 700, color: '#059669' }}>{src.errorRate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
