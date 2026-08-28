import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

const TICKER_ITEMS = [
  { icon: '🔴', text: 'IMD RED ALERT: Severe Torrential Inundation in Mumbai Metropolitan Region' },
  { icon: '🟠', text: 'HEATWAVE WARNING: Mercury crosses 45.4°C in Jaipur and Western Rajasthan' },
  { icon: '⚡', text: 'NOWCAST: Squall lines & severe lightning activity tracked over Kolkata & Sundarbans' },
  { icon: '🌫️', text: 'DENSE FOG ADVISORY: Surface visibility under 40m in Delhi NCR & NH-44' },
  { icon: '🌊', text: 'COASTAL BULLETIN: High tidal wave surge warning for North Andhra & Odisha coastlines' },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Multi-Source Ingestion',
    desc: 'Aggregates extreme weather data from Twitter/X geotags, IMD Doppler radars, OpenWeather API, and citizen reports.',
    icon: '📡',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    step: '02',
    title: 'AI/ML Verification',
    desc: 'NLP models analyze text sentiment, deduplicate occurrences, calculate reliability scores (0-1), and flag misinformation.',
    icon: '🤖',
    color: '#E8640C',
    bg: '#FFF7ED',
  },
  {
    step: '03',
    title: 'Disaster Authority Review',
    desc: 'Meteorological officers and NDRF verify or reject flagged reports with one click, ensuring 100% data integrity.',
    icon: '🛡️',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    step: '04',
    title: 'Real-Time Visualization',
    desc: 'Instantly streams verified weather incidents to national GIS maps, heatmaps, interactive charts, and emergency feeds.',
    icon: '🗺️',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { stats } = useWeather();
  const { isAuthenticated } = useAuth();

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
              maxWidth: '800px',
              margin: '0 auto 36px auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            National Real-Time Weather Big Data Intelligence Platform. Aggregating, validating, and streaming multi-source extreme weather phenomena across all 36 Indian states and territories.
          </p>

          {/* Action CTAs */}
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
              📢 Report Live Weather / Incident
            </button>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
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
              📊 View Weather Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* 4 Animated KPI Stat Counters */}
      <section style={{ maxWidth: '1200px', margin: '-30px auto 40px auto', padding: '0 24px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}
        >
          <StatsCard
            title="Total Events Analyzed"
            value={stats.totalEvents || 12847}
            icon="🌪️"
            accentColor="#2563EB"
            bgColor="#EFF6FF"
            subText="Ingested from 4 Major Streams"
            trend="+18.4% this week"
            trendType="up"
          />
          <StatsCard
            title="Verified Reports"
            value={stats.verifiedCount || 9203}
            icon="✅"
            accentColor="#10B981"
            bgColor="#ECFDF5"
            subText="Validated by IMD & NDRF"
            trend="99.4% precision"
            trendType="up"
          />
          <StatsCard
            title="States & UTs Monitored"
            value={stats.statesMonitored || 36}
            icon="🇮🇳"
            accentColor="#E8640C"
            bgColor="#FFF7ED"
            subText="100% Pan-India Coverage"
            trend="Active 24x7"
            trendType="neutral"
          />
          <StatsCard
            title="Today's Live Ingestion"
            value={stats.todayEvents || 847}
            icon="⚡"
            accentColor="#8B5CF6"
            bgColor="#F5F3FF"
            subText="Real-time 8s Socket Ingestion"
            trend="+12% vs yesterday"
            trendType="up"
          />
        </div>
      </section>

      {/* 4-Step "How It Works" Section */}
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
            End-to-End Architecture
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
            How WeatherSense India Works
          </h2>
          <p style={{ color: '#64748B', maxWidth: '650px', margin: '8px auto 0 auto', fontSize: '1rem' }}>
            Transforming chaotic crowdsourced and sensor big data into verified, actionable national intelligence in seconds.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {HOW_IT_WORKS_STEPS.map((step) => (
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
              Built for National Disaster Preparedness
            </h2>
            <p style={{ color: '#64748B', marginTop: '6px' }}>
              Supporting NDMA, SDMA, District Collectors, and first responders across India.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🛡️</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Automated Misinformation Removal
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Cross-references social media claims against nearby Doppler stations to immediately flag fake flood rumors and old recycled media.
              </p>
            </div>

            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>🗺️</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Interactive GIS Geospatial Layer
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Precision OpenStreetMap GIS markers for 50+ Indian cities with instant zoom, multi-hazard filtering, and popups.
              </p>
            </div>

            <div className="ws-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>⚡</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Sub-Second Socket.io Ingestion
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                Seamless bidirectional streaming delivers instant situational awareness to command center operational monitors.
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
