# WeatherSense India — National Weather Big Data Analytics Platform
**SIH Hackathon 2026 | Problem ID: SIH26069 | Ministry of Earth Sciences (MoES) / IMD**

WeatherSense India is an enterprise-grade MERN stack big data meteorological intelligence platform. It ingests, filters, ML-scores, validates, and visualizes severe weather events (rainfall, urban flooding, heatwaves, squall thunderstorms, dense fog, dust storms, gale winds) in real time across all 36 Indian States & Union Territories.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI in `.env`

### 1. Start the Backend API & Socket Server
```bash
cd weather-platform/backend
npm install
node data/seed.js     # Seeds 60+ weather events across 25 Indian cities & 2 accounts
npm start             # Starts server on http://localhost:5000 (with 8s live socket stream)
```

### 2. Start the React Frontend Application
```bash
cd weather-platform/frontend
npm install
npm start             # Starts UI on http://localhost:3000
```

---

## 🔐 Demo Credentials (Instant 1-Click Login)

The Login page includes **Instant Quick Login** buttons that fill credentials and authenticate in 1 click:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **IMD Admin** | `admin@imd.gov.in` | `admin123` | Full Admin Console, Event Verification/Fake Flagging, Category Reassignment, User Bans, Source Health Telemetry |
| **Citizen Officer** | `citizen@demo.com` | `citizen123` | Live War Room Dashboard, Events Feed, Recharts Analytics, Geospatial Map, Crowdsourced Reporting |

---

## 🌟 Key Capabilities & Features

### 1. War Room Dashboard (`/dashboard`)
- **5 Animated KPI Counters**: Today's Events, Rainfall Clusters, Flood Alerts, Heatwaves, Fake Removed.
- **60% Interactive GIS India Map**: Color-coded markers for each hazard type (Rain: Blue, Flood: Red, Heat: Orange, Storm: Purple, Fog: Grey, Dust: Amber, Winds: Teal). Click markers for telemetry popup.
- **40% Real-Time Live Feed**: Socket.io streaming updates every 8 seconds with smooth slide-in animations.
- **Stacked Bar Chart & Donut Distribution**: Recharts responsive daily hazard volume and breakdown.
- **Multi-Hazard Filter Panel**: Filter by Indian state, date range, status, keyword, and hazard tags.

### 2. Full Viewport GIS Map (`/map`)
- Fullscreen Leaflet map centered on India with OpenStreetMap tiles.
- Floating collapsible GIS filter drawer.
- Color-coded weather marker pins and bottom-right meteorological legend.

### 3. Events Feed & CSV Export (`/events`)
- Search and filter across all 36 states.
- Grid View and List View toggle.
- AI Confidence Meter (0-100%) for each event.
- **"Export CSV"**: Instant frontend CSV download of all filtered records.

### 4. Big Data Analytics Suite (`/analytics`)
- 6 Responsive Recharts charts:
  1. **Line Chart**: Daily event velocity (last 7, 15, 30, 90 days).
  2. **Bar Chart**: Top 10 Indian states by weather incident concentration.
  3. **Area Chart**: 24-hour diurnal ingestion volume.
  4. **Grouped Bar**: Week-over-Week hazard frequency shifts.
  5. **Scatter Plot**: State Data Quality Index (Verified % vs Total).
  6. **Horizontal Breakdown**: Ingestion pipeline distribution (Twitter, IMD, OpenWeather, Citizen).

### 5. IMD Admin Governance Portal (`/admin`)
- **Pending Verification Queue**: One-click **Approve & Verify ✅**, **Mark Fake/Misinformation ❌**, or **Delete 🗑️**.
- **Category Reassignment**: Instantly change hazard classification dropdown.
- **User & Officer Registry**: Account status view and **Ban/Unban toggle**.
- **Data Ingestion Health**: Live telemetry (ping ms, uptime %, error rate %, protocol) for all 5 data feeds.

### 6. Citizen Crowdsourced Reporting (`/citizen-report`)
- Searchable dropdown covering **50+ Indian Cities** with automatic state detection.
- **"📍 Use My Device GPS"**: Browser geolocation capturing exact latitude/longitude.
- Photo proof upload with instant preview.
- 50-character situation validation.
- Animated success modal generating official tracking ID (`#WS-XXXX`).

---

## 🎨 Design System

- **Primary Background**: `#FFFFFF`
- **Sidebar & Header**: `#1B2A4A` (Dark Navy)
- **Primary Accent**: `#E8640C` (Saffron Orange)
- **Success / Verified**: `#10B981` (Emerald Green)
- **Danger / Fake**: `#EF4444` (Crimson Red)
- **Pending**: `#F59E0B` (Amber)
- **Card Background**: `#F8FAFC`
- **Borders**: `#E2E8F0`
- **Typography**: Inter, system-ui, sans-serif

---

## 📁 Repository Structure

```
weather-platform/
├── frontend/               (React Plain JavaScript — Zero TypeScript)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Navbar.js
│   │   │   ├── StatsCard.js
│   │   │   ├── WeatherEventCard.js
│   │   │   ├── FilterPanel.js
│   │   │   ├── IndiaMap.js
│   │   │   ├── RealTimeFeed.js
│   │   │   ├── EventTypeBadge.js
│   │   │   └── VerificationBadge.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EventsFeed.js
│   │   │   ├── Analytics.js
│   │   │   ├── AdminPanel.js
│   │   │   ├── CitizenReport.js
│   │   │   ├── MapView.js
│   │   │   ├── Login.js
│   │   │   └── NotFound.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── WeatherContext.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── indianCities.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── backend/
    ├── models/
    │   ├── User.js
    │   ├── WeatherEvent.js
    │   └── CitizenReport.js
    ├── routes/
    │   ├── auth.js
    │   ├── events.js
    │   ├── reports.js
    │   ├── admin.js
    │   └── analytics.js
    ├── middleware/
    │   ├── auth.js
    │   └── adminOnly.js
    ├── data/
    │   └── seed.js
    ├── server.js
    ├── .env.example
    ├── .env
    └── package.json
```

---

## 🧪 Technology Stack
- **Frontend**: React 18 (Plain JS), React Router v6, React-Leaflet & Leaflet GIS, Recharts, Socket.io-Client, React Hot Toast, Date-fns.
- **Backend**: Node.js, Express, MongoDB & Mongoose, Socket.io, JWT Authentication, Bcryptjs, Cors, Dotenv, Express-Validator.
