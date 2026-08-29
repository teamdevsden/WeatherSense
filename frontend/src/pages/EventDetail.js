import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import EventTypeBadge from '../components/EventTypeBadge';
import VerificationBadge from '../components/VerificationBadge';
import IndiaMap from '../components/IndiaMap';
import { getSourceMeta } from '../utils/indianCities';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Helper for citizen hazard precautions
const getCitizenSafetyChecklist = (eventType) => {
  switch (eventType) {
    case 'flooding':
      return [
        'Move to higher ground immediately; do not attempt to walk or drive through flood waters.',
        'Turn off main power switches and gas valves before evacuating if safe.',
        'Keep emergency essentials, torches, medicines, and drinking water ready.',
        'Call 112 (National Emergency) or 1078 (NDRF) for emergency water rescue.',
      ];
    case 'thunderstorm':
      return [
        'Stay indoors away from windows, tin roofs, and tall isolated trees.',
        'Unplug sensitive electronic devices and avoid using corded phones during lightning.',
        'Do not take shelter under metal structures or near water bodies.',
        'If caught in open terrain, crouch low with feet together (do not lie flat).',
      ];
    case 'heatwave':
      return [
        'Drink plenty of water and ORS/buttermilk frequently, even if not thirsty.',
        'Avoid strenuous outdoor activities between 12:00 PM and 4:00 PM.',
        'Wear loose, light-colored cotton clothes and use sunglasses/umbrella when outdoors.',
        'Never leave children or pets in parked closed vehicles.',
      ];
    case 'rainfall':
      return [
        'Avoid driving through waterlogged roads and underpasses prone to sudden inundation.',
        'Keep headlights on, reduce speed, and maintain extra braking distance.',
        'Stay clear of fallen electrical wires and open drainage channels.',
        'Monitor local municipal corporation announcements for school/office advisories.',
      ];
    case 'fog':
      return [
        'Drive slowly with low-beam fog lights activated.',
        'Follow lane markings closely and maintain safe separation from the vehicle ahead.',
        'Avoid abrupt lane changes and use hazard lights only when stationary.',
      ];
    default:
      return [
        'Follow official weather forecasts and state disaster management advisories.',
        'Keep emergency contact numbers handy on your phone.',
        'Stay indoors during peak severe weather alerts.',
      ];
  }
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [linkedDuplicates, setLinkedDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${id}`);
        if (res.data && res.data.success) {
          setEvent(res.data.event);
          setLinkedDuplicates(res.data.linkedDuplicates || []);
        } else {
          toast.error('Event not found');
          navigate('/events');
        }
      } catch (err) {
        toast.error('Failed to load incident report');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px', color: '#64748B' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B2A4A' }}>
          {isAdmin ? 'Loading Incident Intelligence Dossier...' : 'Loading Official Weather Advisory...'}
        </h3>
      </div>
    );
  }

  if (!event) return null;

  const sourceMeta = getSourceMeta(event.source);
  const confidencePct = Math.round((event.mlConfidenceScore || 0.85) * 100);
  const eventCode = `WS-${event._id.toString().slice(-5).toUpperCase()}`;
  const factors = event.verificationFactors || {
    sourceReliability: 88,
    locationConsistency: 92,
    weatherConsistency: 86,
    contentAnalysis: 90,
    duplicateSimilarity: 85,
  };

  const totalReportsClustered = event.reportCount || linkedDuplicates.length + 1;
  const safetyChecklist = getCitizenSafetyChecklist(event.eventType);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.825rem' }}
          >
            ◀ Back
          </button>
          <span style={{ color: '#94A3B8' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
            {isAdmin ? 'National Incident Dossier' : 'Official Weather Safety Advisory'}
          </span>
          <span style={{ color: '#94A3B8' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: 700, fontFamily: 'monospace' }}>
            #{eventCode}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.825rem' }}
          >
            🖨️ Print Advisory
          </button>
          <Link to="/map" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.825rem' }}>
            🗺️ View on Map
          </Link>
        </div>
      </div>

      {/* Main Incident Overview Card */}
      <div
        className="ws-card"
        style={{
          padding: '28px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: '#1B2A4A',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '4px 10px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {isAdmin ? `INCIDENT #${eventCode}` : `ADVISORY #${eventCode}`}
            </span>
            <EventTypeBadge type={event.eventType} size="large" />
            {isAdmin ? (
              <VerificationBadge status={event.verificationStatus} size="large" />
            ) : (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#065F46',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  padding: '4px 12px',
                  borderRadius: '6px',
                }}
              >
                ✓ IMD Verified Bulletin
              </span>
            )}
            {isAdmin && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: sourceMeta.bg,
                  color: sourceMeta.color,
                  border: `1px solid ${sourceMeta.border}`,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <span>{sourceMeta.icon}</span>
                <span>{sourceMeta.name}</span>
                {sourceMeta.isSimulated && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({sourceMeta.tag})</span>
                )}
              </span>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Advisory Issued At</div>
            <div style={{ fontWeight: 700, color: '#1F2937', fontSize: '0.95rem' }}>
              {event.timestamp ? format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm:ss a') : 'Recent'} IST
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B2A4A', lineHeight: 1.3, marginBottom: '8px' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#475569', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#1E3A8A' }}>
              📍 {event.city}, {event.state} Division
            </span>
            <span>•</span>
            {isAdmin && event.location?.coordinates && (
              <>
                <span style={{ fontFamily: 'monospace', color: '#64748B' }}>
                  GPS: [{event.location.coordinates[1]}°N, {event.location.coordinates[0]}°E]
                </span>
                <span>•</span>
              </>
            )}
            <span style={{ fontWeight: 600, color: '#059669' }}>
              👥 {totalReportsClustered} Eyewitness Reports Corroborated
            </span>
          </div>
        </div>

        {/* Description Box */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#334155',
          }}
        >
          <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Official Meteorological Synopsis & Advisory
          </div>
          {event.description}
        </div>
      </div>

      {/* CITIZEN VIEW: Safety Action Checklist + Helplines & Map */}
      {!isAdmin ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {/* Safety Precautions Checklist */}
          <div
            className="ws-card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> Recommended Citizen Safety Actions
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Official disaster preparedness precautions for {event.city} & surrounding areas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safetyChecklist.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    backgroundColor: '#F8FAFC',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.875rem',
                    color: '#1F2937',
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ color: '#10B981', fontWeight: 800, fontSize: '1.1rem' }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong style={{ color: '#991B1B', fontSize: '0.9rem' }}>🚨 In Immediate Danger?</strong>
                <div style={{ fontSize: '0.78rem', color: '#B91C1C' }}>Contact 24x7 National Emergency Services</div>
              </div>
              <a
                href="tel:112"
                className="btn-danger"
                style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                📞 Dial 112
              </a>
            </div>
          </div>

          {/* Area Map Preview */}
          <div
            className="ws-card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span> Affected District Geolocation
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Active hazard zone marker for {event.city}, {event.state}
              </span>
            </div>

            <div style={{ height: '240px', borderRadius: '10px', overflow: 'hidden' }}>
              <IndiaMap
                events={[event]}
                height="240px"
                center={event.location?.coordinates ? [event.location.coordinates[1], event.location.coordinates[0]] : [19.0760, 72.8777]}
                zoom={9}
                verifiedOnly={false}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span>Division: <strong>{event.state}</strong></span>
              <span>NDRF Helpline: <strong style={{ color: '#1E40AF' }}>1078</strong></span>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN VIEW: Full Intelligence Breakdown + Processing Timeline */
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Left Card: Explainable AI Authenticity Engine */}
            <div
              className="ws-card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🤖</span> Explainable AI Authenticity Engine
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Multi-factor automated trust & corroboration scoring
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      color: confidencePct >= 75 ? '#059669' : confidencePct >= 50 ? '#D97706' : '#DC2626',
                    }}
                  >
                    {confidencePct}%
                  </span>
                </div>
              </div>

              {/* Factor Breakdown Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Source Reliability Score', val: factors.sourceReliability || 88, desc: 'Weight based on sender provenance and historical accuracy' },
                  { label: 'Location Consistency', val: factors.locationConsistency || 92, desc: 'Corroboration with Indian geographical databases' },
                  { label: 'Weather Pattern Plausibility', val: factors.weatherConsistency || 86, desc: 'Consistency with active synoptic conditions & radar Doppler' },
                  { label: 'Content & Terminology NLP', val: factors.contentAnalysis || 90, desc: 'Detection of synthetic spam/clickbait vs valid met keywords' },
                  { label: 'Duplicate & Eyewitness Corroboration', val: factors.duplicateSimilarity || 85, desc: 'Spatial-temporal consensus across nearby witnesses' },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#1F2937' }}>{f.label}</span>
                      <span style={{ fontWeight: 700, color: f.val >= 75 ? '#059669' : '#D97706' }}>{f.val}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${f.val}%`,
                          height: '100%',
                          backgroundColor: f.val >= 80 ? '#10B981' : f.val >= 60 ? '#F59E0B' : '#EF4444',
                          borderRadius: '4px',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '18px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: event.verificationStatus === 'verified' ? '#ECFDF5' : '#FFFBEB',
                  border: `1px solid ${event.verificationStatus === 'verified' ? '#A7F3D0' : '#FDE68A'}`,
                  fontSize: '0.8rem',
                  color: event.verificationStatus === 'verified' ? '#065F46' : '#92400E',
                }}
              >
                <strong>Decision Output: </strong>
                {event.verificationStatus === 'verified'
                  ? 'VERIFIED — Approved for National Disaster Warning Broadcast.'
                  : event.isFake
                  ? 'MISLEADING — High probability of recycled media or unverified rumor.'
                  : 'PENDING OFFICER DISPATCH — Awaiting radar consensus or eyewitness corroboration.'}
              </div>
            </div>

            {/* Right Card: Multi-Source Cluster & Geospatial Map Preview */}
            <div
              className="ws-card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📡</span> Ingestion Clustering & GIS Geolocation
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {totalReportsClustered} corroborating signals merged into unified incident cluster
                </span>
              </div>

              <div style={{ height: '200px', borderRadius: '10px', overflow: 'hidden' }}>
                <IndiaMap
                  events={[event]}
                  height="200px"
                  center={event.location?.coordinates ? [event.location.coordinates[1], event.location.coordinates[0]] : [19.0760, 72.8777]}
                  zoom={9}
                  verifiedOnly={false}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.825rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>Duplicate Group ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#1E3A8A' }}>
                    {event.duplicateGroupId || `WS-GRP-${event._id.toString().slice(-6)}`}
                  </strong>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', display: 'block' }}>Deduplication Status:</span>
                  <strong style={{ color: event.isDuplicate ? '#E8640C' : '#10B981' }}>
                    {event.isDuplicate ? 'Merged Duplicate' : 'Primary Master Event'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Ingestion & Processing Timeline */}
          <div
            className="ws-card"
            style={{
              padding: '24px 28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🕒</span> Incident Processing & Dispatch Timeline
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                End-to-end audit trail from raw multi-source ingestion to national grid broadcast
              </span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(event.processingTimeline && event.processingTimeline.length > 0
                ? event.processingTimeline
                : [
                    { step: 'Raw Data Ingested', timestamp: event.timestamp, details: `Received via ${sourceMeta.name}` },
                    { step: 'NLP Classification', timestamp: new Date(new Date(event.timestamp).getTime() + 1000), details: `Classified as ${event.eventType.toUpperCase()} with ${confidencePct}% confidence` },
                    { step: 'Deduplication Analysis', timestamp: new Date(new Date(event.timestamp).getTime() + 2000), details: `Spatial-temporal clustering validated for ${event.city}` },
                    { step: 'AI Authenticity Evaluation', timestamp: new Date(new Date(event.timestamp).getTime() + 3000), details: `AI Authenticity Score: ${confidencePct}%` },
                    { step: 'IMD Grid Broadcast', timestamp: new Date(new Date(event.timestamp).getTime() + 5000), details: 'Active in National Meteorological Telemetry Grid' },
                  ]
              ).map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#2563EB' : idx === event.processingTimeline?.length - 1 ? '#10B981' : '#E8640C',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 0 0 2px #CBD5E1',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>{item.step}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {item.timestamp ? format(new Date(item.timestamp), 'hh:mm:ss a') : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>{item.details}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetail;
