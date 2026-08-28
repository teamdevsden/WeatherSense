import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATE_COLORS = ['#2563EB', '#3B82F6', '#0284C7', '#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#059669', '#E8640C', '#D97706'];

const Analytics = () => {
  const [daysRange, setDaysRange] = useState(30);
  const [trends, setTrends] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [trendsRes, sourcesRes] = await Promise.all([
          api.get(`/analytics/trends?days=${daysRange}`),
          api.get('/analytics/sources'),
        ]);

        if (trendsRes.data && trendsRes.data.success) {
          setTrends(trendsRes.data);
        }
        if (sourcesRes.data && sourcesRes.data.success) {
          setSources(sourcesRes.data.sources || []);
        }
      } catch (err) {
        toast.error('Failed to load big data analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [daysRange]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Date Range Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2A4A' }}>
            National Big Data Weather Analytics & Trends
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Multi-dimensional meteorological intelligence, AI verification ratios, and historical hazard patterns
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Time Horizon:</span>
          {[
            { label: '7 Days', val: 7 },
            { label: '15 Days', val: 15 },
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setDaysRange(item.val)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: daysRange === item.val ? 'var(--primary-accent)' : '#E2E8F0',
                backgroundColor: daysRange === item.val ? 'var(--primary-accent)' : '#FFFFFF',
                color: daysRange === item.val ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !trends ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Calculating national meteorological regressions & aggregates...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          {/* Chart 1: Line chart: Daily events last 30 days */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                1. Daily Incident Velocity (Last {daysRange} Days)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Total incoming reports vs AI verified incidents
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2A4A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="total" name="Total Reports" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="verified" name="Verified Events" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bar chart: Top 10 states by event count */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                2. Top 10 States by Weather Incidents
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Highest volume regional weather anomaly concentrations
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.topStates} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="state" stroke="#94A3B8" fontSize={10} angle={-25} textAnchor="end" tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2A4A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Bar dataKey="total" name="Total Events" radius={[6, 6, 0, 0]}>
                    {trends.topStates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATE_COLORS[index % STATE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Area chart: Hourly volume last 24 hours */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                3. Hourly Ingestion Volume (Last 24 Hours)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Diurnal pattern and alert spike detection
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.hourlyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8640C" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E8640C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2A4A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Area type="monotone" dataKey="events" name="Reports / Hour" stroke="#E8640C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHourly)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Grouped bar: This week vs last week by event type */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                4. Week-over-Week Hazard Comparison
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Shift in hazard frequencies comparing Current vs Previous 7-Day window
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.weekComparison} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="type" stroke="#94A3B8" fontSize={10} angle={-15} textAnchor="end" tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2A4A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }} />
                  <Bar dataKey="thisWeek" name="This Week" fill="#E8640C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lastWeek" name="Last Week" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Scatter: Verified % vs total per state */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                5. State Verification Quality Matrix
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Total state incident volume vs % validated by IMD/Doppler (Data Quality Index)
              </span>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" dataKey="totalEvents" name="Total Events" unit=" ev" stroke="#94A3B8" fontSize={11} />
                  <YAxis type="number" dataKey="verifiedPercentage" name="Verified %" unit="%" domain={[40, 100]} stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: '#1B2A4A', color: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, marginBottom: '2px' }}>{d.state}</div>
                          <div>Total Events: {d.totalEvents}</div>
                          <div>Verified: {d.verifiedPercentage}%</div>
                          <div>Fake Flags: {d.fakeCount}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="State Hubs" data={trends.stateScatter} fill="#8B5CF6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Horizontal bar: Source breakdown */}
          <div className="ws-card" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                6. Multi-Source Ingestion Breakdown
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Volume and percentage share by ingestion pipeline
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
              {sources.map((src) => (
                <div key={src.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>{src.name}</span>
                    <span style={{ fontWeight: 700, color: src.color }}>
                      {src.count} records ({src.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${src.percentage}%`,
                        height: '100%',
                        backgroundColor: src.color,
                        borderRadius: '5px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
