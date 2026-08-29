import React, { useState } from 'react';
import { INDIAN_STATES, EVENT_TYPES_CONFIG, SOURCE_CONFIGS } from '../utils/indianCities';

const FilterPanel = ({ filters, onFilterChange, onReset, compact = false }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleTypeToggle = (typeKey) => {
    let currentTypes = localFilters.type === 'all' || !localFilters.type ? [] : localFilters.type.split(',');
    if (currentTypes.includes(typeKey)) {
      currentTypes = currentTypes.filter((t) => t !== typeKey);
    } else {
      currentTypes.push(typeKey);
    }
    const finalVal = currentTypes.length === 0 ? 'all' : currentTypes.join(',');
    handleChange('type', finalVal);
  };

  const handleApply = (e) => {
    e?.preventDefault();
    onFilterChange(localFilters);
  };

  const handleResetClick = () => {
    const resetVals = {
      state: 'All States',
      type: 'all',
      status: 'all',
      source: 'all',
      startDate: '',
      endDate: '',
      search: '',
    };
    setLocalFilters(resetVals);
    if (onReset) onReset();
    else onFilterChange(resetVals);
  };

  const selectedTypesList = localFilters.type === 'all' || !localFilters.type ? [] : localFilters.type.split(',');

  return (
    <div
      className="ws-card"
      style={{
        padding: compact ? '16px' : '20px 24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <span>🔍</span> Multi-Dimensional Intelligence Filters
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleResetClick}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.825rem' }}
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.825rem' }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        {/* Search Keyword */}
        <div>
          <label className="form-label">Search City / #Hashtag</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Pune, #HeavyRain, Flood"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* State Dropdown */}
        <div>
          <label className="form-label">State / UT (36 Regions)</label>
          <select
            className="form-select"
            value={localFilters.state || 'All States'}
            onChange={(e) => handleChange('state', e.target.value)}
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="form-label">Data Ingestion Source</label>
          <select
            className="form-select"
            value={localFilters.source || 'all'}
            onChange={(e) => handleChange('source', e.target.value)}
          >
            <option value="all">All 6 Ingestion Streams</option>
            {SOURCE_CONFIGS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.icon} {s.shortName} {s.isSimulated ? '(Demo)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="form-label">Verification Status</label>
          <select
            className="form-select"
            value={localFilters.status || 'all'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="all">All Statuses (Verified + Pending + Misleading)</option>
            <option value="verified">✅ Verified Incidents</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="fake">❌ Misleading / Flagged</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-input"
            value={localFilters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-input"
            value={localFilters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* Event Types Multi-Select Badges */}
      <div>
        <label className="form-label" style={{ marginBottom: '8px' }}>
          Select Hazard Types (Click to toggle)
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleChange('type', 'all')}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1.5px solid',
              borderColor: localFilters.type === 'all' || !localFilters.type ? '#E8640C' : '#E2E8F0',
              backgroundColor: localFilters.type === 'all' || !localFilters.type ? '#FFF7ED' : '#FFFFFF',
              color: localFilters.type === 'all' || !localFilters.type ? '#E8640C' : '#64748B',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🌟 All Hazards
          </button>
          {EVENT_TYPES_CONFIG.map((cfg) => {
            const isSelected = selectedTypesList.includes(cfg.key);
            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => handleTypeToggle(cfg.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1.5px solid',
                  borderColor: isSelected ? cfg.color : '#E2E8F0',
                  backgroundColor: isSelected ? cfg.bg : '#FFFFFF',
                  color: isSelected ? cfg.color : '#64748B',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
