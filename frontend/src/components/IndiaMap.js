import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { format } from 'date-fns';
import EventTypeBadge from './EventTypeBadge';
import VerificationBadge from './VerificationBadge';

// Helper to create custom Leaflet DivIcons with color-coded markers
const createCustomMarker = (eventType, status) => {
  const colors = {
    rainfall: '#2563EB',      // Blue
    flooding: '#EF4444',      // Red
    heatwave: '#E8640C',      // Orange
    thunderstorm: '#8B5CF6',  // Purple
    fog: '#64748B',           // Grey
    dust_storm: '#D97706',    // Amber/Yellow
    strong_winds: '#0D9488',  // Teal
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

  const color = colors[eventType] || '#E8640C';
  const iconSymbol = icons[eventType] || '🌦️';
  const isFake = status === 'fake';

  const html = `
    <div style="
      width: 34px;
      height: 34px;
      background: ${isFake ? '#EF4444' : color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      border: 2px solid #FFFFFF;
      transition: transform 0.2s ease;
    ">
      <div style="transform: rotate(45deg); font-size: 15px;">
        ${iconSymbol}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

const IndiaMap = ({ events = [], height = '460px', center = [22.5937, 78.9629], zoom = 5, verifiedOnly = false }) => {
  // Pre-calculate valid marker positions (filtered for verified only if specified)
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
    <div style={{ width: '100%', height, position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {validEvents.map((ev) => {
          const [lng, lat] = ev.location.coordinates;
          const markerIcon = createCustomMarker(ev.eventType, ev.verificationStatus);

          return (
            <Marker key={ev._id || `${lat}-${lng}-${Math.random()}`} position={[lat, lng]} icon={markerIcon}>
              <Popup className="custom-popup">
                <div style={{ padding: '14px', maxWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <EventTypeBadge type={ev.eventType} size="small" />
                    <VerificationBadge status={ev.verificationStatus} size="small" />
                  </div>

                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2937', marginBottom: '4px' }}>
                    {ev.title}
                  </h5>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' }}>
                    📍 <strong>{ev.city}</strong>, {ev.state}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4, marginBottom: '8px' }}>
                    {ev.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#64748B',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '6px',
                    }}
                  >
                    <span>🕒 {ev.timestamp ? format(new Date(ev.timestamp), 'dd MMM, hh:mm a') : 'Now'}</span>
                    <span style={{ fontWeight: 600, color: '#059669' }}>
                      Status: Official Alert
                    </span>
                  </div>
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
