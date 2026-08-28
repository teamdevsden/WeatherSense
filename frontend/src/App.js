import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { WeatherProvider } from './context/WeatherContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EventsFeed from './pages/EventsFeed';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import CitizenReport from './pages/CitizenReport';
import MapView from './pages/MapView';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Protected Route Guard for logged in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌦️</div>
          <div style={{ fontWeight: 600, color: '#1B2A4A' }}>Authenticating WeatherSense Node...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin-Only Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontWeight: 600, color: '#1B2A4A' }}>Verifying Officer Security Clearances...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast.error('Restricted area: Administrator credentials required.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Shell Layout
const AppShell = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="app-layout">
      {/* Sidebar rendered on operational pages */}
      {!isPublicPage && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen-report"
              element={<CitizenReport />}
            />

            {/* Admin Only Route */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <WeatherProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1B2A4A',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                borderRadius: '8px',
                padding: '10px 16px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          <AppShell />
        </WeatherProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
