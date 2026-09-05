import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('weathersense_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate initial session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('weathersense_token');
      const storedUser = localStorage.getItem('weathersense_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with server in background
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('weathersense_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error.message);
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, showToast = true) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('weathersense_token', receivedToken);
        localStorage.setItem('weathersense_user', JSON.stringify(receivedUser));
        if (showToast) {
          toast.success(`Welcome back, ${receivedUser.name}!`);
        }
        return { success: true, user: receivedUser };
      }
      const msg = res.data?.message || 'Invalid response from server';
      if (showToast) toast.error(msg);
      return { success: false, message: msg };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed. Please check credentials.';
      if (showToast) {
        toast.error(msg);
      }
      return { success: false, message: msg };
    }
  };

  const quickLogin = async (role = 'admin', showToast = true) => {
    if (role === 'admin') {
      return await login('admin@imd.gov.in', 'admin123', showToast);
    } else {
      return await login('citizen@demo.com', 'citizen123', showToast);
    }
  };

  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('weathersense_token');
    localStorage.removeItem('weathersense_user');
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    quickLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
