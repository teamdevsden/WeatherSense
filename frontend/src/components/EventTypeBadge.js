import React from 'react';
import { getEventTypeMeta } from '../utils/indianCities';

const EventTypeBadge = ({ type, size = 'normal' }) => {
  const meta = getEventTypeMeta(type);

  const isSmall = size === 'small';

  return (
    <span
      className="badge"
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
        padding: isSmall ? '2px 8px' : '4px 12px',
        fontSize: isSmall ? '0.7rem' : '0.8rem',
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: isSmall ? '0.85rem' : '0.95rem' }}>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
};

export default EventTypeBadge;
