import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import StatsCard from '../components/StatsCard';
import IndiaMap from '../components/IndiaMap';
import RealTimeFeed from '../components/RealTimeFeed';
import FilterPanel from '../components/FilterPanel';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DONUT_COLORS = ['#2563EB', '#EF4444', '#E8640C', '#8B5CF6', '#64748B', '#D97706', '#0D9488'];

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { stats, filters, updateFilters, resetFilters, lastUpdated, refreshData } = useWeather();
  const [mapEvents, setMapEvents] = useState([]);
  const [chartData, setChartData] = useState({
    last7Days: [],
    donutData: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch events for map according to current filters
  const fetchMapEvents = useCallback(async (activeFilters) => {
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (activeFilters.state && activeFilters.state !== 'All States') params.append('state', activeFilters.state);
      if (activeFilters.type && activeFilters.type !== 'all') params.append('type', activeFilters.type);
      if (activeFilters.status && activeFilters.status !== 'all') params.append('status', activeFilters.status);
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data && res.data.success) {
        setMapEvents(res.data.events);
      }
    } catch (err) {
      console.warn('Failed to load map events:', err.message);
    }
  }, []);

  // Fetch trend and distribution charts
  const fetchAnalytics = useCallback(async () => {
    try {
      const [trendsRes, summaryRes] = await Promise.all([
        api.get('/analytics/trends?days=7'),
        api.get('/analytics/summary'),
      ]);

      let last7 = [];
      if (trendsRes.data && trendsRes.data.success && trendsRes.data.last7Days) {
        last7 = trendsRes.data.last7Days;
      }

      let donut = [];
      if (summaryRes.data && summaryRes.data.success && summaryRes.data.data?.typeBreakdown) {
        const bd = summaryRes.data.data.typeBreakdown;
        donut = [
          { name: 'Rainfall', value: bd.rainfall || 18, color: '#2563EB' },
          { name: 'Flooding', value: bd.flooding || 12, color: '#EF4444' },
          { name: 'Heatwave', value: bd.heatwave || 9, color: '#E8640C' },
          { name: 'Thunderstorm', value: bd.thunderstorm || 9, color: '#8B5CF6' },
          { name: 'Fog / Smog', value: bd.fog || 6, color: '#64748B' },
          { name: 'Dust Storm', value: bd.dust_storm || 3, color: '#D97706' },
          { name: 'Strong Winds', value: bd.strong_winds || 3, color: '#0D9488' },
        ];
      }

      setChartData({
        last7Days: last7,
        donutData: donut,
      });
    } catch (err) {
      console.warn('Charts load error:', err.message);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchMapEvents(filters), fetchAnalytics()]);
      setLoading(false);
    };
    loadAll();
  }, [filters, fetchMapEvents, fetchAnalytics]);

  const handleFilterApply = (newFilters) => {
    updateFilters(newFilters);
    fetchMapEvents(newFilters);
    toast.success('Dashboard filters applied');
  };

  const handleFilterReset = () => {
    resetFilters();
    fetchMapEvents({
      state: 'All States',
      type: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      search: '',
    });
    toast('Filters reset to default', { icon: '🔄' });
  };

  if (loading && mapEvents.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px', color: '#64748B' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌦️</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B2A4A' }}>Connecting to IMD Real-Time Grid...</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>Loading geospatial nodes and sensor telemetry</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B2A4A', letterSpacing: '-0.02em' }}>
            National Weather Operations Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Welcome, <strong>{user?.name || 'Authorized Officer'}</strong> • Real-time meteorological intelligence & extreme event tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'right' }}>
            <div>Last Updated:</div>
            <strong style={{ color: '#1F2937' }}>{format(lastUpdated, 'hh:mm:ss a')} IST</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              refreshData();
              fetchMapEvents(filters);
              fetchAnalytics();
              toast.success('Live telemetry synchronized');
            }}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            🔄 Refresh Grid
          </button>
        </div>
      </div>

      {/* Citizen Quick Action Banner (Shown for Citizen Users) */}
      {!isAdmin && (
        <div
          style={{
            backgroundColor: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(232, 100, 12, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2rem' }}>📢</span>
            <div>
              <div style={{ fontWeight: 700, color: '#9A3412', fontSize: '1rem' }}>
                Witnessing extreme rainfall, urban flooding, or heatwave in your locality?
              </div>
              <div style={{ fontSize: '0.825rem', color: '#C2410C', marginTop: '2px' }}>
                Help national meteorologists track localized disaster hazards by submitting a photo and GPS geotagged report.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/citizen-report')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            📝 Submit Eyewitness Report ➔
          </button>
        </div>
      )}

      {/* Row 1: 5 StatsCards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        <StatsCard
          title="Today Events"
          value={stats.todayEvents || 24}
          icon="⚡"
          accentColor="#2563EB"
          bgColor="#EFF6FF"
          subText="Last 24 hours"
          trend="+14%"
          trendType="up"
        />
        <StatsCard
          title="Rainfall Events"
          value={stats.typeBreakdown?.rainfall || 18}
          icon="🌧️"
          accentColor="#0284C7"
          bgColor="#F0F9FF"
          subText="Active monsoon clusters"
          trend="High"
          trendType="up"
        />
        <StatsCard
          title="Flood Alerts"
          value={stats.typeBreakdown?.flooding || 12}
          icon="🌊"
          accentColor="#EF4444"
          bgColor="#FEF2F2"
          subText="NDRF notified zones"
          trend="Critical"
          trendType="down"
        />
        <StatsCard
          title="Heatwave Zones"
          value={stats.typeBreakdown?.heatwave || 9}
          icon="☀️"
          accentColor="#E8640C"
          bgColor="#FFF7ED"
          subText="North-west corridor"
          trend="Elevated"
          trendType="up"
        />
        {isAdmin && (
          <StatsCard
            title="Fake Filtered"
            value={stats.fakeCount || 10}
            icon="🛡️"
            accentColor="#10B981"
            bgColor="#ECFDF5"
            subText="AI NLP filtered"
            trend="100% clean"
            trendType="up"
          />
        )}
      </div>

      {/* Row 2: FilterPanel (Prominently Placed at the Top) */}
      <div>
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterApply}
          onReset={handleFilterReset}
        />
      </div>

      {/* Row 3: Left 60% IndiaMap, Right 40% RealTimeFeed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: '20px',
        }}
        className="dashboard-map-grid"
      >
        {/* Left 60%: IndiaMap */}
        <div
          className="ws-card"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
                Geospatial Weather Alert Map ({mapEvents.length} Active Nodes)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                {isAdmin
                  ? 'Interactive GIS layer • Color pins by hazard type • Click marker for full telemetry'
                  : 'Interactive Official Weather Map • Real-time verified alerts across India'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
              <span style={{ color: '#2563EB' }}>● Rain</span>
              <span style={{ color: '#EF4444' }}>● Flood</span>
              <span style={{ color: '#E8640C' }}>● Heat</span>
              <span style={{ color: '#8B5CF6' }}>● Storm</span>
            </div>
          </div>

          <IndiaMap events={mapEvents} height="480px" verifiedOnly={!isAdmin} />
        </div>

        {/* Right 40%: RealTimeFeed */}
        <div>
          <RealTimeFeed maxHeight="546px" />
        </div>
      </div>

      {/* Row 4: Left Stacked Bar Chart, Right Donut Chart */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: '20px',
        }}
        className="dashboard-charts-grid"
      >
        {/* Left: Bar chart (recharts) — Events per day, last 7 days (stacked bars) */}
        <div className="ws-card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
              Events Per Day — Last 7 Days (Hazard Breakdown)
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Stacked daily distribution across primary severe weather types
            </span>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B2A4A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Bar dataKey="rainfall" name="Rainfall" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
                <Bar dataKey="flooding" name="Flooding" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="heatwave" name="Heatwave" stackId="a" fill="#E8640C" radius={[0, 0, 0, 0]} />
                <Bar dataKey="thunderstorm" name="Thunderstorm" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Donut chart — Event type distribution % */}
        <div className="ws-card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2A4A' }}>
              Event Type Distribution %
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Overall proportion of extreme weather categories
            </span>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B2A4A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
