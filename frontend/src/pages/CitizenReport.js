import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { INDIAN_CITIES, EVENT_TYPES_CONFIG } from '../utils/indianCities';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CitizenReport = () => {
  const { user, isAuthenticated, loading, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.role === 'admin' ? 'Rahul Sharma' : (user?.name || 'Rahul Sharma'),
    phone: user?.role === 'admin' ? '9876543210' : (user?.phone || '9876543210'),
    city: 'Mumbai',
    state: 'Maharashtra',
    eventType: 'rainfall',
    eventTimestamp: new Date().toISOString().slice(0, 16),
    description: '',
    coordinates: [72.8777, 19.0760], // [lng, lat]
    photoUrl: '',
    videoUrl: '',
  });

  // Auto-switch to citizen session if accessed directly or from admin session
  useEffect(() => {
    if (!loading && (user?.role === 'admin' || !isAuthenticated)) {
      quickLogin('citizen', false);
    }
  }, [loading, user, isAuthenticated, quickLogin]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [locationStatus, setLocationStatus] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReport, setSuccessReport] = useState(null);
  const [errors, setErrors] = useState({});

  // City selection updates State and coordinates automatically
  const handleCityChange = (cityName) => {
    const matched = INDIAN_CITIES.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        city: matched.city,
        state: matched.state,
        coordinates: [matched.lng, matched.lat],
      }));
    } else {
      setFormData((prev) => ({ ...prev, city: cityName }));
    }
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('Acquiring high-accuracy GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          coordinates: [Number(longitude.toFixed(5)), Number(latitude.toFixed(5))],
        }));
        setLocationStatus(`📍 GPS Locked: [${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E] (±${Math.round(accuracy)}m)`);
        toast.success('Exact coordinates captured from device GPS');
      },
      (err) => {
        console.warn('Geo error:', err.message);
        setLocationStatus('Could not retrieve GPS (permission denied or timeout). Using city center.');
        toast.error('GPS permission denied. Using default city coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Image Upload Preview
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be below 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          photoUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please provide your full name';
    if (!formData.city) errs.city = 'Please select your city';
    if (!formData.description || formData.description.trim().length < 20) {
      errs.description = `Description must be at least 20 characters long (currently ${formData.description.trim().length}/20)`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please resolve the errors highlighted in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!isAuthenticated) {
        await quickLogin('citizen', false);
      }
      const res = await api.post('/reports', {
        reporterName: formData.name,
        reporterPhone: formData.phone,
        city: formData.city,
        state: formData.state,
        coordinates: formData.coordinates,
        eventType: formData.eventType,
        description: formData.description,
        photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80',
        videoUrl: formData.videoUrl || '',
        eventTimestamp: formData.eventTimestamp,
      });

      if (res.data && res.data.success) {
        setSuccessReport({
          code: res.data.reportCode || `WS-${Math.floor(10000 + Math.random() * 90000)}`,
          city: formData.city,
          state: formData.state,
          eventType: formData.eventType,
          weatherEventId: res.data.weatherEventId,
          aiEvaluation: res.data.aiEvaluation,
        });
        toast.success('Report dispatched to IMD National Central Grid');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessReport(null);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      city: 'Mumbai',
      state: 'Maharashtra',
      eventType: 'rainfall',
      eventTimestamp: new Date().toISOString().slice(0, 16),
      description: '',
      coordinates: [72.8777, 19.0760],
      photoUrl: '',
      videoUrl: '',
    });
    setPhotoPreview(null);
    setLocationStatus('');
    setErrors({});
  };

  return (
    <div className="page-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Success Modal / Card if submitted */}
      {successReport ? (
        <div
          className="ws-card slide-in-item"
          style={{
            padding: '40px 30px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '2px solid #10B981',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontSize: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              border: '2px solid #A7F3D0',
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1B2A4A', marginBottom: '8px' }}>
            Weather Report Submitted Successfully!
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '24px' }}>
            Your eyewitness meteorological report has been ingested and queued for AI verification.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              padding: '18px 28px',
              borderRadius: '12px',
              marginBottom: '28px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
              NATIONAL REPORT ID
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-accent)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
              {successReport.code}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#D97706',
                backgroundColor: '#FFFBEB',
                padding: '3px 12px',
                borderRadius: '12px',
                border: '1px solid #FDE68A',
                marginTop: '4px',
              }}
            >
              Status: Pending AI Verification
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {successReport.weatherEventId && (
              <button
                type="button"
                onClick={() => navigate(`/events/${successReport.weatherEventId}`)}
                className="btn-primary"
              >
                📄 View Incident Dossier
              </button>
            )}
            <button type="button" onClick={handleReset} className="btn-secondary">
              ➕ Submit Another Report
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
              📊 Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Citizen Report Form */
        <div
          className="ws-card"
          style={{
            padding: '36px 32px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#E8640C',
                backgroundColor: '#FFF7ED',
                padding: '3px 12px',
                borderRadius: '20px',
                marginBottom: '10px',
              }}
            >
              <span>🇮🇳 National Citizen Weather Intelligence</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1B2A4A' }}>
              Submit Eyewitness Weather Incident
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.925rem', marginTop: '4px' }}>
              Provide real-time photos, video & GPS coordinates to alert meteorologists and disaster response teams.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Reporter Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Reporter Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* City & Auto-filled State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">City / Town (50+ Indian Cities) *</label>
                <select
                  className="form-select"
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.state})
                    </option>
                  ))}
                </select>
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>

              <div>
                <label className="form-label">State / UT (Auto-detected)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  readOnly
                  style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* Hazard Type & Date/Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Extreme Weather Phenomenon *</label>
                <select
                  className="form-select"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                >
                  {EVENT_TYPES_CONFIG.map((cfg) => (
                    <option key={cfg.key} value={cfg.key}>
                      {cfg.icon} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Observation Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.eventTimestamp}
                  onChange={(e) => setFormData({ ...formData, eventTimestamp: e.target.value })}
                />
              </div>
            </div>

            {/* GPS Geolocation Button */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1F2937' }}>
                    Geotag Coordinates: [{formData.coordinates[1]}°N, {formData.coordinates[0]}°E]
                  </span>
                  {locationStatus && (
                    <div style={{ fontSize: '0.78rem', color: '#E8640C', marginTop: '2px' }}>{locationStatus}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.825rem' }}
                >
                  📍 Use My Device GPS
                </button>
              </div>
            </div>

            {/* Description (min 20 chars) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Eyewitness Observation & Incident Details *
                </label>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: formData.description.length >= 20 ? '#059669' : '#DC2626',
                    fontWeight: 600,
                  }}
                >
                  {formData.description.length}/20 characters minimum
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe current rainfall intensity, water levels, road blockages, fallen trees, wind speed, or visibility..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Photo & Video Attachment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Attach Photo Proof (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    fontSize: '0.85rem',
                  }}
                />
                {photoPreview && (
                  <div style={{ marginTop: '10px', position: 'relative', width: '120px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                    <img src={photoPreview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Video Clip Link (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                {isSubmitting ? 'Processing through AI Verification...' : '🚀 Submit Report & Generate WS-ID'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CitizenReport;
