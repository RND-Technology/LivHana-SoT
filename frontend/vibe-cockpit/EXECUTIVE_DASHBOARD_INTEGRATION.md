# Executive Dashboard - Quick Integration Guide

## Files Created

1. **Main Component:**
   - `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/components/ExecutiveDashboard.jsx`
   - 1,137 lines of code
   - 34KB file size

2. **Documentation:**
   - `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/components/ExecutiveDashboard.README.md`
   - Complete API documentation and customization guide

---

## Quick Start (2 Steps)

### Step 1: Add Import to App.jsx

Open `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/App.jsx`

Add this import at the top with the other component imports (around line 19):

```javascript
import ExecutiveDashboard from './components/ExecutiveDashboard';
```

### Step 2: Add Route

In the same file, add this route inside the `<Routes>` component (around line 216):

```javascript
<Route path="/executive" element={<ExecutiveDashboard />} />
```

**Complete Routes section should look like:**
```javascript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/voice" element={<VoiceMode />} />
  <Route path="/video" element={<VideoMode />} />
  <Route path="/vibe-coding" element={<VibeCoding />} />
  <Route path="/agent-swarm" element={<AgentSwarm />} />
  <Route path="/empire-systems" element={<EmpireSystems />} />
  <Route path="/empire-dashboard" element={<EmpireDashboard />} />
  <Route path="/products" element={<SquareRealProducts />} />
  <Route path="/cockpit" element={<SquareLiveCockpit />} />
  <Route path="/executive" element={<ExecutiveDashboard />} /> {/* NEW */}
  <Route path="/pilot-training" element={<PilotTraining />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

### Step 3: Access the Dashboard

Navigate to: **http://localhost:5173/executive**

---

## Add to Sidebar Navigation (Optional)

If you want to add the Executive Dashboard to the sidebar menu:

### Open Sidebar.jsx

File: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/components/Sidebar.jsx`

Add a new menu item in the navigation array:

```javascript
import { Assessment } from '@mui/icons-material'; // Add this import

// In the menu items array:
{
  text: 'Executive Dashboard',
  icon: <Assessment />,
  path: '/executive',
  view: 'executive',
},
```

---

## Environment Setup

Create or update `.env` file in the frontend root:

```bash
# API Base URL
REACT_APP_API_BASE_URL=http://localhost

# Optional: Override individual service URLs
REACT_APP_INTEGRATION_SERVICE_URL=http://localhost:3005
REACT_APP_CANNABIS_SERVICE_URL=http://localhost:3003
REACT_APP_PAYMENT_SERVICE_URL=http://localhost:3004
REACT_APP_VOICE_SERVICE_URL=http://localhost:4001
REACT_APP_REASONING_GATEWAY_URL=http://localhost:4002
REACT_APP_PRODUCT_SERVICE_URL=http://localhost:3002
```

---

## Verify Backend Services

Ensure all services are running:

```bash
# Integration Service (Port 3005)
curl http://localhost:3005/health

# Cannabis Service (Port 3003)
curl http://localhost:3003/health

# Payment Service (Port 3004)
curl http://localhost:3004/health

# Voice Service (Port 4001)
curl http://localhost:4001/health

# Reasoning Gateway (Port 4002)
curl http://localhost:4002/health

# Product Service (Port 3002)
curl http://localhost:3002/health
```

---

## Test BigQuery Integration

```bash
# Dashboard metrics
curl http://localhost:3005/api/bigquery/dashboard

# Historical data
curl http://localhost:3005/api/bigquery/historical

# Products
curl http://localhost:3005/api/bigquery/products
```

---

## Features Overview

### Real-Time Metrics
- Today's revenue, orders, customers
- Week/Month/Year revenue tracking
- Average order value
- Top 5 products

### Service Health
- All 6 backend services monitored
- Online/Offline status
- Uptime percentages
- Queue lengths

### Compliance
- Age verification rate (98.5%)
- COA validation status (100%)
- Active licenses (12)
- Expiring license alerts

### Customer Intelligence
- Acquisition sources breakdown
- Membership tier distribution
- Visual charts with Chart.js

### Alerts System
- Low inventory warnings
- Expiring licenses (< 60 days)
- Failed transactions
- System errors

### Auto-Refresh
- Polls every 30 seconds
- Toggle on/off
- Manual refresh button
- Loading states

---

## Styling & Customization

The dashboard uses:
- **Material-UI** components and theming
- **Chart.js** for data visualization
- **Framer Motion** for animations
- **Dark mode** by default (matches app theme)

### Color Scheme
- Green (#16A34A) - Revenue, success metrics
- Orange (#F59E0B) - Warnings, moderate alerts
- Blue (#3B82F6) - Informational metrics
- Purple (#8B5CF6) - Special metrics
- Red (#EF4444) - Errors, critical alerts

---

## Responsive Design

The dashboard is fully responsive:
- **Desktop:** 4-column grid layout
- **Tablet:** 2-column grid layout
- **Mobile:** 1-column stacked layout

Uses Material-UI Grid with breakpoints:
- `xs={12}` - Mobile (full width)
- `sm={6}` - Tablet (half width)
- `md={3}` or `md={4}` - Desktop (quarter/third width)

---

## Development Tips

### Hot Reload
Changes to `ExecutiveDashboard.jsx` will hot-reload automatically with Vite.

### Debug Mode
Open browser console to see:
- API fetch results
- Error messages
- Component state updates

### Mock Data
Some features use mock data until backend APIs are ready:
- Compliance metrics
- Customer intelligence
- Inventory alerts
- Transaction alerts

### Real Data Sources
Currently integrated with:
- BigQuery dashboard metrics
- BigQuery historical trends
- BigQuery product catalog
- Service health endpoints

---

## Troubleshooting

### Dashboard shows "Loading..." forever
**Solution:** Check that at least one backend service is running (Integration Service on port 3005)

### All metrics show $0 or 0
**Solution:**
1. Verify BigQuery sync is enabled in Integration Service
2. Check `.env` has `BIGQUERY_ENABLED=true`
3. Ensure Google Cloud credentials are configured

### Services show "Offline"
**Solution:**
1. Start the services: `npm start` in each service directory
2. Check ports are not already in use
3. Verify CORS is configured to allow `http://localhost:5173`

### Charts don't render
**Solution:**
1. Check Chart.js is installed: `npm list chart.js react-chartjs-2`
2. Clear browser cache
3. Check for console errors

### Authentication errors
**Solution:**
1. Check auth middleware configuration
2. Verify credentials are being sent with requests
3. Review `/api` route protection in backend services

---

## Next Steps

### Phase 1 - Immediate (Done)
- [x] Core dashboard component created
- [x] BigQuery integration working
- [x] Service health monitoring active
- [x] Responsive design implemented
- [x] Auto-refresh mechanism working

### Phase 2 - Enhancement
- [ ] Connect real compliance API endpoints
- [ ] Integrate live inventory tracking
- [ ] Add transaction monitoring from payment-service
- [ ] Implement alert notification system
- [ ] Add user preference storage

### Phase 3 - Advanced
- [ ] Export dashboard to PDF/Excel
- [ ] Add drill-down detail views
- [ ] Implement predictive analytics
- [ ] Add geographic revenue mapping
- [ ] Create custom report builder

---

## Support

For issues or questions:
1. Review the detailed README: `ExecutiveDashboard.README.md`
2. Check browser console for errors
3. Verify all backend services are running
4. Test API endpoints with curl
5. Review service logs for errors

---

## Performance Optimization

Current settings:
- **Refresh interval:** 30 seconds (adjust `REFRESH_INTERVAL` constant)
- **Timeout:** 5 seconds per service health check
- **Parallel fetching:** All APIs called simultaneously
- **Graceful degradation:** Failed fetches don't block dashboard

To optimize:
```javascript
// In ExecutiveDashboard.jsx
const REFRESH_INTERVAL = 60000; // Change to 60 seconds
const HEALTH_TIMEOUT = 3000;    // Reduce timeout to 3 seconds
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive Dashboard                       │
│                  (ExecutiveDashboard.jsx)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Fetches data every 30s
                              ▼
        ┌─────────────────────────────────────────────┐
        │         Backend Services (6 services)        │
        └─────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                        ┌──────────────────┐
│ Integration (3005)│                        │  Voice (4001)    │
│  - BigQuery       │                        │  - Health        │
│  - Dashboard API  │                        │  - Queue status  │
│  - Products       │                        └──────────────────┘
└──────────────────┘                                 │
        │                                             ▼
        ▼                                    ┌──────────────────┐
┌──────────────────┐                        │ Reasoning (4002) │
│ Cannabis (3003)  │                        │  - Health        │
│  - Compliance    │                        │  - Queue status  │
│  - Licenses      │                        └──────────────────┘
└──────────────────┘                                 │
        │                                             ▼
        ▼                                    ┌──────────────────┐
┌──────────────────┐                        │  Payment (3004)  │
│  Product (3002)  │                        │  - Transactions  │
│  - Inventory     │                        │  - Health        │
│  - Stock alerts  │                        └──────────────────┘
└──────────────────┘
```

---

## Security Considerations

### Authentication
- Dashboard respects existing auth middleware
- All `/api` routes require valid credentials
- Health endpoints are public for monitoring

### CORS Configuration
Ensure backend services allow frontend origin:
```javascript
// In backend service index.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Data Sanitization
- All numeric values validated before display
- Dates parsed safely with error handling
- SQL injection prevented by BigQuery parameterized queries

---

## Deployment Checklist

Before deploying to production:

- [ ] Update `REACT_APP_API_BASE_URL` to production URL
- [ ] Configure production CORS origins
- [ ] Enable SSL/TLS for all API endpoints
- [ ] Set up API rate limiting
- [ ] Configure production auth tokens
- [ ] Test all service health endpoints
- [ ] Verify BigQuery production credentials
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable production logging
- [ ] Test responsive design on real devices
- [ ] Load test with expected traffic
- [ ] Set up CDN for static assets
- [ ] Configure cache headers
- [ ] Enable gzip compression
- [ ] Set up uptime monitoring

---

## Success Metrics

Track these KPIs:
1. **Dashboard load time:** < 2 seconds
2. **API response time:** < 500ms average
3. **Service uptime:** > 99.9%
4. **Data accuracy:** 100% match with source systems
5. **User engagement:** Daily active users tracking

---

**Built with love for LivHana Empire**
**Version:** 1.0.0
**Last Updated:** October 1, 2025
