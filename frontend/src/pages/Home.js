import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { useWeather } from '../context/WeatherContext';

const TICKER_ITEMS = [
  { icon: '🔴', text: 'IMD RED ALERT: Heavy Torrential Rainfall Warning for Coastal Districts' },
  { icon: '🟠', text: 'HEATWAVE ADVISORY: Temperature exceeding 44°C in Western Region • Stay Hydrated' },
  { icon: '⚡', text: 'NOWCAST: Severe lightning activity & squall lines tracked over Eastern Zone' },
  { icon: '🌫️', text: 'DENSE FOG ADVISORY: Surface visibility reduced on National Highways' },
  { icon: '🌊', text: 'COASTAL BULLETIN: High tidal surge advisory for Coastal Fishermen & Port Areas' },
];

const CITIZEN_LIFECYCLE_STEPS = [
  {
    step: '01',
    title: 'Multi-Source Early Ingestion',
    desc: 'Aggregates ground-level observations from citizens, Doppler weather radars, and verified national weather sensors across India.',
    icon: '📡',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    step: '02',
    title: 'Severe Hazard Assessment',
    desc: 'Analyzes severe weather phenomena—including torrential rainfall, urban flooding, heatwaves, squalls, and dense fog.',
    icon: '🌪️',
    color: '#E8640C',
    bg: '#FFF7ED',
  },
  {
    step: '03',
    title: 'Scientific Validation & Filtering',
    desc: 'Filters out unverified misinformation and cross-references reports with official meteorological benchmarks for high reliability.',
    icon: '🛡️',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    step: '04',
    title: 'Instant Public Warning Broadcast',
    desc: 'Transmits real-time color-coded safety bulletins, evacuation guidance, and emergency alerts to citizens and local disaster units.',
    icon: '📢',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { stats } = useWeather();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Top Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1B2A4A 0%, #111C33 100%)',
          color: '#FFFFFF',
          padding: '80px 24px 60px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(232, 100, 12, 0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.6,
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Government Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '24px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#F8FAFC',
            }}
          >
            <span>🇮🇳 India Meteorological Department</span>
            <span>•</span>
            <span>Ministry of Earth Sciences</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '18px',
            }}
          >
            WeatherSense <span style={{ color: 'var(--primary-accent)' }}>India</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: '#CBD5E1',
              maxWidth: '850px',
              margin: '0 auto 36px auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            National Public Weather Safety & Disaster Warning Platform for India. Real-time community incident reporting, verified multi-hazard alerts, and comprehensive emergency guidelines.
          </p>

          {/* Action CTAs for Citizens */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/citizen-report')}
              className="btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '1.05rem',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(232, 100, 12, 0.4)',
              }}
            >
              📢 Submit Eyewitness Report
            </button>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="btn-secondary"
              style={{
                padding: '14px 28px',
                fontSize: '1.05rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              🗺️ Explore Live Weather Map
            </button>
            <button
              type="button"
              onClick={() => navigate('/safety-guidelines')}
              className="btn-secondary"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#6EE7B7',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              🛡️ Emergency Guidelines & 112
            </button>
          </div>
        </div>
      </section>

      {/* 4 Public-Facing Safety KPI Stat Counters */}
      <section style={{ maxWidth: '1200px', margin: '-30px auto 40px auto', padding: '0 24px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}
        >
          <StatsCard
            title="Weather Reports Monitored"
            value={stats.totalReports || 142}
            icon="🌪️"
            accentColor="#2563EB"
            bgColor="#EFF6FF"
            subText="Pan-India Incident Monitoring"
            trend="+18% this week"
            trendType="up"
          />
          <StatsCard
            title="Active Weather Alerts"
            value={stats.verifiedCount || 52}
            icon="✅"
            accentColor="#10B981"
            bgColor="#ECFDF5"
            subText="Official Disaster Advisories"
            trend="100% Validated"
            trendType="up"
          />
          <StatsCard
            title="States & UTs Covered"
            value={stats.statesMonitored || 36}
            icon="🇮🇳"
            accentColor="#E8640C"
            bgColor="#FFF7ED"
            subText="100% Nationwide Reach"
            trend="Active 24x7"
            trendType="neutral"
          />
          <StatsCard
            title="Emergency Network"
            value="112 / 1078"
            icon="🛡️"
            accentColor="#8B5CF6"
            bgColor="#F5F3FF"
            subText="National & State Disaster Response"
            trend="Toll-Free"
            trendType="neutral"
          />
        </div>
      </section>

      {/* 4-Step Public Safety & Response Section */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Citizen Safety & Response System
          </span>
          <h2
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#1B2A4A',
              marginTop: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            How WeatherSense Protects Communities
          </h2>
          <p style={{ color: '#64748B', maxWidth: '650px', margin: '8px auto 0 auto', fontSize: '1rem' }}>
            Bridging citizen eyewitness reports with meteorological data to deliver fast, verified disaster alerts across India.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {CITIZEN_LIFECYCLE_STEPS.map((step) => (
            <div
              key={step.step}
              className="ws-card ws-card-hover"
              style={{
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: step.bg,
                    color: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#E2E8F0',
                    fontFamily: 'monospace',
                  }}
                >
                  {step.step}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1F2937' }}>
                {step.title}
              </h3>

              <p style={{ fontSize: '0.885rem', color: '#64748B', lineHeight: 1.55 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 24px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1B2A4A' }}>
              Nationwide Disaster Safety Capabilities
            </h2>
            <p style={{ color: '#64748B', marginTop: '6px' }}>
              Equipping citizens, first responders, and municipal disaster teams across all 36 Indian states & UTs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🛡️</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Verified Official Bulletins
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Access authenticated severe weather alerts categorized into Red, Orange, and Yellow warning levels with immediate safety instructions.
              </p>
            </div>

            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🗺️</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Interactive Public Hazard Map
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Explore live GIS meteorological warnings across 50+ Indian cities with instant district filtering and safety advisories.
              </p>
            </div>

            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>📢</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Community Eyewitness Reporting
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Submit ground-level observations, waterlogging photos, and weather incidents to help disaster authorities respond faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Scrolling Weather Alert Ticker at Bottom */}
      <div style={{ marginTop: 'auto' }}>
        <div className="ticker-wrap">
          <div className="ticker-content">
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
              <div key={idx} className="ticker-item">
                <span>{item.icon}</span>
                <span style={{ fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
