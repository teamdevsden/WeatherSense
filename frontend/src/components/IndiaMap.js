import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import VerificationBadge from './VerificationBadge';
import { getSourceMeta } from '../utils/indianCities';
import { useAuth } from '../context/AuthContext';

// Helper to get citizen safety advisory text
const getSafetyAdvice = (eventType) => {
  switch (eventType) {
    case 'flooding':
      return '🚨 Flood Alert: Avoid waterlogged low-lying areas and underpasses. Follow local evacuation orders.';
    case 'thunderstorm':
      return '⚡ Lightning Watch: Seek immediate indoor shelter. Disconnect electrical appliances.';
    case 'heatwave':
      return '☀️ Extreme Heat: Stay hydrated, avoid direct sun between 12-4 PM, and protect vulnerable seniors.';
    case 'rainfall':
      return '🌧️ Torrential Rain: Drive cautiously with headlights on and watch for water accumulation.';
    case 'fog':
      return '🌫️ Low Visibility: Use fog lights, maintain safe vehicle distance, and reduce speed.';
    case 'dust_storm':
      return '🌪️ High Winds: Stay away from loose structures and billboards. Keep windows closed.';
    default:
      return '⚠️ Weather Advisory: Exercise caution and monitor official local disaster updates.';
  }
};

// Helper to create custom Leaflet DivIcons with color-coded markers
const createCustomMarker = (eventType, status) => {
  const colors = {
    rainfall: '#2563EB',      // Blue
    flooding: '#DC2626',      // Red
    heatwave: '#EA580C',      // Orange
    thunderstorm: '#9333EA',  // Purple
    fog: '#64748B',           // Grey/White
    dust_storm: '#D97706',    // Amber/Yellow
    strong_winds: '#059669',  // Emerald/Green
    other: '#475569',
  };

  const icons = {
    rainfall: '🌧️',
    flooding: '🌊',
    heatwave: '☀️',
    thunderstorm: '⚡',
    fog: '🌫️',
    dust_storm: '🌪️',
    strong_winds: '💨',
    other: '⚠️',
  };

  const isFake = status === 'fake' || status === 'misleading';
  const color = isFake ? '#EF4444' : colors[eventType] || '#EA580C';
  const iconSymbol = icons[eventType] || '🌦️';

  const html = `
    <div style="
      width: 36px;
      height: 36px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      border: 2px solid #FFFFFF;
      transition: transform 0.2s ease;
    ">
      <div style="transform: rotate(45deg); font-size: 16px;">
        ${iconSymbol}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
};

const IndiaMap = ({ events = [], height = '460px', center = [22.5937, 78.9629], zoom = 5, verifiedOnly = false }) => {
  const { isAdmin } = useAuth();

  // Pre-calculate valid marker positions
  const validEvents = useMemo(() => {
    return events.filter(
      (ev) =>
        ev.location &&
        Array.isArray(ev.location.coordinates) &&
        ev.location.coordinates.length >= 2 &&
        !isNaN(ev.location.coordinates[0]) &&
        !isNaN(ev.location.coordinates[1]) &&
        (!verifiedOnly || ev.verificationStatus === 'verified')
    );
  }, [events, verifiedOnly]);

  return (
    <div
      style={{
        width: '100%',
        height,
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validEvents.map((ev) => {
          const [lng, lat] = ev.location.coordinates;
          const markerIcon = createCustomMarker(ev.eventType, ev.verificationStatus);
          const src = getSourceMeta(ev.source);
          const confidence = Math.round((ev.mlConfidenceScore || 0.85) * 100);
          const totalReports = ev.reportCount || 1;
          const safetyAdvice = getSafetyAdvice(ev.eventType);

          return (
            <Marker key={ev._id || `${lat}-${lng}-${Math.random()}`} position={[lat, lng]} icon={markerIcon}>
              <Popup className="custom-popup">
                <div style={{ padding: '14px', maxWidth: '300px' }}>
                  {/* Header badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <EventTypeBadge type={ev.eventType} size="small" />
                    {isAdmin ? (
                      <VerificationBadge status={ev.verificationStatus} size="small" />
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          border: '1px solid #BBF7D0',
                        }}
                      >
                        ✓ IMD Verified Alert
                      </span>
                    )}
                  </div>

                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1F2937', marginBottom: '4px', lineHeight: 1.3 }}>
                    {ev.title}
                  </h5>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>
                    📍 <strong>{ev.city}</strong>, {ev.state}
                  </div>

                  {/* Citizen vs Admin Specific Popup Body */}
                  {isAdmin ? (
                    <>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          backgroundColor: '#F8FAFC',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span>Stream: <strong>{src.shortName}</strong></span>
                        <span>Reports: <strong style={{ color: '#059669' }}>{totalReports} Clustered</strong></span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: '#64748B',
                          marginBottom: '10px',
                        }}
                      >
                        <span>🕒 {ev.timestamp ? format(new Date(ev.timestamp), 'dd MMM, hh:mm a') : 'Now'}</span>
                        <span style={{ fontWeight: 700, color: confidence >= 75 ? '#059669' : '#D97706' }}>
                          AI Score: {confidence}%
                        </span>
                      </div>

                      {ev._id && !ev._id.toString().startsWith('live-') && (
                        <Link
                          to={`/events/${ev._id}`}
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            backgroundColor: 'var(--sidebar-header)',
                            color: '#FFFFFF',
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          ⚡ View Intelligence Dossier
                        </Link>
                      )}
                    </>
                  ) : (
                    /* Clean Citizen Safety Advisory */
                    <>
                      <div
                        style={{
                          backgroundColor: '#FFF7ED',
                          border: '1px solid #FED7AA',
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '0.78rem',
                          color: '#9A3412',
                          lineHeight: 1.4,
                          marginBottom: '8px',
                        }}
                      >
                        {safetyAdvice}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.74rem',
                          color: '#475569',
                          marginBottom: '10px',
                        }}
                      >
                        <span>🕒 {ev.timestamp ? format(new Date(ev.timestamp), 'dd MMM, hh:mm a') : 'Live'}</span>
                        <span style={{ fontWeight: 700, color: '#DC2626' }}>🚨 Helpline: 112</span>
                      </div>

                      {ev._id && !ev._id.toString().startsWith('live-') && (
                        <Link
                          to={`/events/${ev._id}`}
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          📢 View Full Safety Advisory
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
