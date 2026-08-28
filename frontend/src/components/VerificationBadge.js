import React from 'react';

const VerificationBadge = ({ status, size = 'normal' }) => {
  const isSmall = size === 'small';

  const config = {
    verified: {
      label: 'Verified',
      icon: '✅',
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
    },
    fake: {
      label: 'Fake / Misinfo',
      icon: '❌',
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
    },
    pending: {
      label: 'Pending Review',
      icon: '⏳',
      bg: '#FFFBEB',
      color: '#D97706',
      border: '#FDE68A',
    },
  };

  const current = config[status] || config.pending;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '0.7rem' : '0.78rem',
        fontWeight: 600,
      }}
    >
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
};

export default VerificationBadge;
