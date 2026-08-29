import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from '../components/FilterPanel';
import WeatherEventCard from '../components/WeatherEventCard';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EventsFeed = () => {
  const { filters, updateFilters, resetFilters } = useWeather();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = useCallback(async (activeFilters, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '20');
      if (activeFilters.state && activeFilters.state !== 'All States') params.append('state', activeFilters.state);
      if (activeFilters.type && activeFilters.type !== 'all') params.append('type', activeFilters.type);
      if (activeFilters.status && activeFilters.status !== 'all') params.append('status', activeFilters.status);
      if (activeFilters.source && activeFilters.source !== 'all') params.append('source', activeFilters.source);
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data && res.data.success) {
        setEvents(res.data.events);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setCurrentPage(res.data.page || 1);
      }
    } catch (error) {
      toast.error('Failed to load events list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(filters, 1);
  }, [filters, fetchEvents]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchEvents(filters, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/verify/${id}`, { status: 'verified' });
      toast.success('Event marked as Verified');
      fetchEvents(filters, currentPage);
    } catch (err) {
      toast.error('Verification update failed');
    }
  };

  const handleMarkFake = async (id) => {
    try {
      await api.put(`/admin/verify/${id}`, { status: 'fake' });
      toast.error('Event marked as Fake/Misinformation');
      fetchEvents(filters, currentPage);
    } catch (err) {
      toast.error('Failed to flag event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this event from the national database?')) {
      try {
        await api.delete(`/admin/events/${id}`);
        toast.success('Event deleted');
        fetchEvents(filters, currentPage);
      } catch (err) {
        toast.error('Failed to delete event');
      }
    }
  };

  // Frontend-only CSV Export
  const exportToCSV = () => {
    if (events.length === 0) {
      toast.error('No events available to export');
      return;
    }

    const headers = [
      'Event ID',
      'Source',
      'Title',
      'Hazard Type',
      'City',
      'State',
      'Longitude',
      'Latitude',
      'Verification Status',
      'AI Confidence Score',
      'Timestamp',
    ];

    const rows = events.map((ev) => [
      `"${ev._id}"`,
      `"${ev.source}"`,
      `"${(ev.title || '').replace(/"/g, '""')}"`,
      `"${ev.eventType}"`,
      `"${ev.city}"`,
      `"${ev.state}"`,
      ev.location?.coordinates?.[0] || '',
      ev.location?.coordinates?.[1] || '',
      `"${ev.verificationStatus}"`,
      ev.mlConfidenceScore || '',
      `"${ev.timestamp ? new Date(ev.timestamp).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WeatherSense_Events_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${events.length} records to CSV successfully!`);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '18px 24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2A4A' }}>
            {isAdmin ? 'National Incidents Registry & Live Feed' : 'Official Weather Alerts & Incident Bulletins'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            {isAdmin
              ? `Displaying ${events.length} of ${totalCount} multi-source weather incidents across India`
              : `Displaying ${events.length} verified real-time weather advisories and safety bulletins`}
          </p>
        </div>

        {/* View Toggle & CSV Export (CSV Export only for Admin) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#1B2A4A' : '#64748B',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ⊞ Grid View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'list' ? '#1B2A4A' : '#64748B',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              ☰ List View
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={exportToCSV}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              📥 Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={(newFilters) => {
          updateFilters(newFilters);
          fetchEvents(newFilters, 1);
        }}
        onReset={() => {
          resetFilters();
          fetchEvents({
            state: 'All States',
            type: 'all',
            status: 'all',
            startDate: '',
            endDate: '',
            search: '',
          }, 1);
        }}
      />

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔄</div>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Fetching weather telemetry...</p>
        </div>
      ) : events.length === 0 ? (
        <div
          className="ws-card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748B',
            backgroundColor: '#FFFFFF',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔍</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1F2937' }}>No Weather Events Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 16px auto' }}>
            No records matched your current filter criteria. Try expanding the state selection or resetting filters.
          </p>
          <button
            type="button"
            onClick={() => {
              resetFilters();
              fetchEvents({
                state: 'All States',
                type: 'all',
                status: 'all',
                startDate: '',
                endDate: '',
                search: '',
              }, 1);
            }}
            className="btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Event Cards in Grid or List Mode */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr',
            gap: '16px',
          }}
        >
          {events.map((ev) => (
            <WeatherEventCard
              key={ev._id}
              event={ev}
              isAdmin={isAdmin}
              onVerify={handleVerify}
              onMarkFake={handleMarkFake}
              onDelete={handleDelete}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '16px 0',
          }}
        >
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            ◀ Previous
          </button>

          {/* Compact Paginated Numbers */}
          {(() => {
            const getPaginationRange = (curr, total) => {
              if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
              if (curr <= 4) return [1, 2, 3, 4, 5, '...', total];
              if (curr >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
              return [1, '...', curr - 1, curr, curr + 1, '...', total];
            };

            return getPaginationRange(currentPage, totalPages).map((item, idx) =>
              item === '...' ? (
                <span key={`dots-${idx}`} style={{ padding: '0 6px', color: '#94A3B8', fontWeight: 700 }}>
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentPage === item ? 'var(--primary-accent)' : '#E2E8F0',
                    backgroundColor: currentPage === item ? 'var(--primary-accent)' : '#FFFFFF',
                    color: currentPage === item ? '#FFFFFF' : '#1F2937',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              )
            );
          })()}

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
