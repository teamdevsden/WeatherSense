import React from 'react';

const HELPLINES = [
  { name: 'National Emergency Helpline', number: '112', desc: 'Single emergency number across India (Police, Fire, Ambulance)', icon: '🚨', bg: '#FEF2F2', color: '#DC2626' },
  { name: 'NDRF Disaster Control Room', number: '1078 / 011-24363260', desc: 'National Disaster Response Force Headquarters', icon: '🛡️', bg: '#EFF6FF', color: '#2563EB' },
  { name: 'State Disaster Management Authority (SDMA)', number: '1070', desc: 'Toll-free state emergency operation center', icon: '🏛️', bg: '#FFF7ED', color: '#E8640C' },
  { name: 'District Disaster Management (DDMA)', number: '1077', desc: 'District emergency operation center', icon: '📍', bg: '#F5F3FF', color: '#8B5CF6' },
  { name: 'Medical Emergency & Ambulance', number: '108', desc: 'National Health Mission Emergency Medical Services', icon: '🚑', bg: '#ECFDF5', color: '#059669' },
  { name: 'Fire & Rescue Service', number: '101', desc: 'Fire hazards and swift water rescue operations', icon: '🚒', bg: '#FFFBEB', color: '#D97706' },
];

const GUIDELINES = [
  {
    hazard: 'Flash Floods & Waterlogging',
    icon: '🌊',
    color: '#2563EB',
    dos: [
      'Move immediately to higher ground or upper floors.',
      'Turn off main electrical switches and gas connections before evacuating.',
      'Boil drinking water or use water purification tablets.',
      'Keep emergency kit (torch, dry food, power bank, first aid) handy.',
    ],
    donts: [
      'Do not attempt to walk, swim, or drive through moving flood waters.',
      'Do not touch fallen electric power lines or submerged transformers.',
      'Avoid consuming food items that have come in contact with flood waters.',
    ],
  },
  {
    hazard: 'Severe Thunderstorm & Lightning',
    icon: '⚡',
    color: '#8B5CF6',
    dos: [
      'Seek shelter inside a sturdy building or metal-topped vehicle.',
      'Stay away from windows, tin sheds, and open balconies.',
      'Unplug sensitive electrical appliances during severe lightning.',
    ],
    donts: [
      'Never take shelter under tall or isolated trees or electric poles.',
      'Do not use corded phones or touch metal plumbing during lightning.',
      'Do not remain in open water bodies, rivers, or open swimming pools.',
    ],
  },
  {
    hazard: 'Extreme Heatwave & Sunstroke',
    icon: '☀️',
    color: '#E8640C',
    dos: [
      'Drink plenty of water and hydration fluids (ORSS, lassi, lemon water).',
      'Wear lightweight, loose-fitting, light-colored cotton clothing.',
      'Keep animals and pets in shaded areas with ample fresh drinking water.',
    ],
    donts: [
      'Avoid direct outdoor sun exposure between 12:00 PM and 3:30 PM.',
      'Avoid high-protein foods, alcohol, and caffeine which accelerate dehydration.',
      'Never leave children or elderly inside parked closed vehicles.',
    ],
  },
];

const SafetyGuidelines = () => {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px 28px',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>
              National Disaster Safety & Emergency Helplines
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Official advisories from National Disaster Management Authority (NDMA) & IMD
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Helplines Grid */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2A4A', marginBottom: '14px' }}>
          24x7 National & State Emergency Hotlines
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {HELPLINES.map((hl, idx) => (
            <div
              key={idx}
              className="ws-card ws-card-hover"
              style={{
                padding: '20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: hl.bg,
                  color: hl.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                }}
              >
                {hl.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1F2937' }}>{hl.name}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: hl.color, marginTop: '2px', fontFamily: 'monospace' }}>
                  {hl.number}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>{hl.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hazard Do's and Don'ts */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B2A4A', marginBottom: '14px' }}>
          Weather Hazard Safety Protocols (Do's & Don'ts)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {GUIDELINES.map((g, idx) => (
            <div
              key={idx}
              className="ws-card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.3rem' }}>{g.icon}</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B2A4A', margin: 0 }}>
                  {g.hazard} Safety Protocol
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Do's */}
                <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.875rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✅</span> DO'S (काय करावे)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: '#14532D', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {g.dos.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.875rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>❌</span> DON'TS (काय करू नये)
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.825rem', color: '#7F1D1D', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {g.donts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyGuidelines;
