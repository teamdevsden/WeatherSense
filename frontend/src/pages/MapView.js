import React, { useState, useEffect, useCallback } from 'react';
import IndiaMap from '../components/IndiaMap';
import { INDIAN_STATES, EVENT_TYPES_CONFIG, SOURCE_CONFIGS } from '../utils/indianCities';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MapView = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [filters, setFilters] = useState({
    state: 'All States',
    source: 'all',
    selectedTypes: ['rainfall', 'flooding', 'heatwave', 'thunderstorm', 'fog', 'dust_storm', 'strong_winds'],
    status: 'all',
  });

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (filters.state !== 'All States') params.append('state', filters.state);
      if (filters.source && filters.source !== 'all') params.append('source', filters.source);
      if (filters.selectedTypes.length > 0 && filters.selectedTypes.length < EVENT_TYPES_CONFIG.length) {
        params.append('type', filters.selectedTypes.join(','));
      }
      if (filters.status !== 'all') params.append('status', filters.status);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data && res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      toast.error('Failed to load geospatial telemetry');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const toggleType = (key) => {
    setFilters((prev) => {
      const exists = prev.selectedTypes.includes(key);
      const updated = exists ? prev.selectedTypes.filter((t) => t !== key) : [...prev.selectedTypes, key];
      return { ...prev, selectedTypes: updated };
    });
  };

  const selectAllTypes = () => {
    setFilters((prev) => ({
      ...prev,
      selectedTypes: EVENT_TYPES_CONFIG.map((c) => c.key),
    }));
  };

  const clearAllTypes = () => {
    setFilters((prev) => ({
      ...prev,
      selectedTypes: [],
    }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Fullscreen Leaflet Map Container */}
      <IndiaMap events={events} height="100%" zoom={5} verifiedOnly={!isAdmin} />

      {/* Floating Left Filter Drawer */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: drawerOpen ? '320px' : '48px',
          maxHeight: 'calc(100% - 40px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1px solid #E2E8F0',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#1B2A4A',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {drawerOpen ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span>
                <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>GIS Layer Filters</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
                title="Collapse Drawer"
              >
                ◀
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '1.2rem',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center',
              }}
              title="Expand GIS Filter Drawer"
            >
              ⚙️
            </button>
          )}
        </div>

        {/* Drawer Body */}
        {drawerOpen && (
          <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Active Count Badge */}
            <div style={{ backgroundColor: '#EFF6FF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
              <span style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 600 }}>
                {loading ? '🔄 Updating telemetry...' : `Showing ${events.length} active GIS markers`}
              </span>
            </div>

            {/* State Filter */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by State</label>
              <select
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingestion Source Filter (Admin Only) */}
            {isAdmin && (
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Ingestion Stream</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                >
                  <option value="all">All 6 Ingestion Streams</option>
                  {SOURCE_CONFIGS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.icon} {s.shortName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Verification Status (Admin Only) */}
            {isAdmin && (
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Status Level</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All (Verified + Pending + Fake)</option>
                  <option value="verified">✅ Verified Incidents</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="fake">❌ Fake / Flagged</option>
                </select>
              </div>
            )}

            {/* Hazard Types Checkbox List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>Hazard Types</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={selectAllTypes} style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                    All
                  </button>
                  <span style={{ color: '#CBD5E1', fontSize: '0.72rem' }}>|</span>
                  <button type="button" onClick={clearAllTypes} style={{ border: 'none', background: 'none', color: '#64748B', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                    Clear
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {EVENT_TYPES_CONFIG.map((cfg) => {
                  const checked = filters.selectedTypes.includes(cfg.key);
                  return (
                    <label
                      key={cfg.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.825rem',
                        color: '#1F2937',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        backgroundColor: checked ? '#F8FAFC' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleType(cfg.key)}
                        style={{ accentColor: cfg.color }}
                      />
                      <span>{cfg.icon}</span>
                      <span>{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom-Right Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          border: '1px solid #E2E8F0',
          zIndex: 1000,
          fontSize: '0.78rem',
        }}
      >
        <div style={{ fontWeight: 700, color: '#1B2A4A', marginBottom: '8px' }}>
          📍 GIS Meteorological Legend
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span>Rainfall</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span>Flooding</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E8640C' }} />
            <span>Heatwave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
            <span>Thunderstorm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748B' }} />
            <span>Dense Fog</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            <span>Dust Storm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
