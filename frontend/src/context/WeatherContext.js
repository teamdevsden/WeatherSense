import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';

const WeatherContext = createContext();

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const WeatherProvider = ({ children }) => {
  const [liveFeed, setLiveFeed] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 12847,
    todayEvents: 847,
    verifiedCount: 9203,
    fakeCount: 312,
    pendingCount: 412,
    statesMonitored: 36,
  });
  const [filters, setFilters] = useState({
    state: 'All States',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch initial summary stats
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/analytics/summary');
      if (res.data && res.data.success) {
        setStats((prev) => ({
          ...prev,
          ...res.data.data,
        }));
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.warn('Could not fetch summary, using cached values:', error.message);
    }
  }, []);

  // Fetch initial recent live events
  const fetchRecentEvents = useCallback(async () => {
    try {
      const res = await api.get('/events?limit=15');
      if (res.data && res.data.success && res.data.events) {
        setLiveFeed(res.data.events);
      }
    } catch (error) {
      console.warn('Could not fetch recent events:', error.message);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchRecentEvents();

    // Initialize Socket.io connection
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to WeatherSense live socket streamer');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket streamer');
      setIsConnected(false);
    });

    // Real-time weather event arrives every 8s
    socket.on('new_weather_event', (newEvent) => {
      setLiveFeed((prev) => [newEvent, ...prev.slice(0, 24)]);
      setLastUpdated(new Date());
    });

    // Real-time stats update arrives
    socket.on('stats_update', (newStats) => {
      setStats((prev) => ({
        ...prev,
        totalEvents: newStats.total || prev.totalEvents + 1,
        todayEvents: newStats.today || prev.todayEvents + 1,
        verifiedCount: newStats.verified || prev.verifiedCount,
        fakeCount: newStats.fake || prev.fakeCount,
        pendingCount: newStats.pending || prev.pendingCount,
      }));
      setLastUpdated(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchSummary, fetchRecentEvents]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      state: 'All States',
      type: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      search: '',
    });
  };

  const value = {
    liveFeed,
    stats,
    filters,
    updateFilters,
    resetFilters,
    isConnected,
    lastUpdated,
    refreshData: () => {
      fetchSummary();
      fetchRecentEvents();
    },
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
