import React, { useEffect, useState } from 'react';

const StatsCard = ({
  title,
  value,
  icon,
  accentColor = '#E8640C',
  bgColor = '#FFF7ED',
  subText,
  trend,
  trendType = 'up',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = numValue / steps;

    if (numValue === 0) {
      setDisplayValue(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="ws-card ws-card-hover"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <h3
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#1F2937',
              marginTop: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            {typeof value === 'number' ? displayValue.toLocaleString('en-IN') : value}
          </h3>
        </div>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: bgColor,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}
        >
          {icon}
        </div>
      </div>

      {(subText || trend) && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#64748B',
          }}
        >
          <span>{subText}</span>
          {trend && (
            <span
              style={{
                fontWeight: 600,
                color: trendType === 'up' ? '#10B981' : trendType === 'down' ? '#EF4444' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              {trendType === 'up' ? '▲' : trendType === 'down' ? '▼' : '•'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
