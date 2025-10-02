# Executive Dashboard - Implementation Guide

## Overview
Complete executive dashboard component with real-time metrics, service health monitoring, compliance tracking, and intelligent alerts.

**File:** `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit/src/components/ExecutiveDashboard.jsx`

**Lines of Code:** 1,137
**File Size:** 34KB

---

## Features Implemented

### 1. Real-time BigQuery Metrics
- **Revenue Tracking:** Today, Week, Month, Year revenue with trend indicators
- **Order Metrics:** Today's orders and total order count
- **Customer Analytics:** Active customers and total customer base
- **Average Order Value:** Calculated from BigQuery data
- **Top Products:** Top 5 products by price (can be enhanced with sales data)

### 2. Service Health Monitoring
Monitors all 6 backend services:
- **Integration Service** (Port 3005)
- **Cannabis Service** (Port 3003)
- **Payment Service** (Port 3004)
- **Voice Service** (Port 4001)
- **Reasoning Gateway** (Port 4002)
- **Product Service** (Port 3002)

Each service shows:
- Online/Offline status with visual indicators
- Uptime percentage
- Queue length (when applicable)
- Last health check timestamp

### 3. Compliance Dashboard
- **Age Verification Rate:** Real-time pass rate with progress bar
- **COA Validation Status:** Certificate of Analysis validation tracking
- **Active Licenses:** Count of currently valid licenses
- **License Expiration Tracking:** Color-coded warnings for expiring licenses
  - Red alert: < 30 days
  - Yellow alert: 30-60 days

### 4. Customer Intelligence
Two visual analytics charts:
- **Acquisition Sources:** Doughnut chart showing customer source breakdown
  - Organic Search, Social Media, Referral, Direct
- **Membership Tiers:** Bar chart showing tier distribution
  - Premium, Standard, Basic membership levels

### 5. Alerts Section
Four categories of alerts:
- **Low Inventory Warnings:** Products below stock threshold
- **Expiring Licenses:** Licenses expiring within 60 days
- **Failed Transactions:** Payment gateway failures and errors
- **System Errors:** Service health issues and system failures

### 6. Interactive Features
- **Auto-refresh:** Polls data every 30 seconds (toggleable)
- **Manual Refresh:** Button to fetch latest data immediately
- **Loading States:** Smooth transitions and skeleton screens
- **Error Handling:** Graceful degradation with retry options
- **Responsive Design:** Works on desktop, tablet, and mobile

---

## API Endpoints Used

### BigQuery Integration Service (Port 3005)
```javascript
GET /api/bigquery/dashboard    // Main revenue and customer metrics
GET /api/bigquery/historical   // 7-day revenue trend data
GET /api/bigquery/products     // Product catalog with pricing
```

### Service Health Endpoints
```javascript
GET http://localhost:3005/health  // Integration Service
GET http://localhost:3003/health  // Cannabis Service
GET http://localhost:3004/health  // Payment Service
GET http://localhost:4001/health  // Voice Service
GET http://localhost:4002/health  // Reasoning Gateway
GET http://localhost:3002/health  // Product Service
```

---

## Integration Steps

### 1. Import the Component
```javascript
import ExecutiveDashboard from './components/ExecutiveDashboard';
```

### 2. Add to Router
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/executive" element={<ExecutiveDashboard />} />
</Routes>
```

### 3. Environment Configuration
Create or update `.env` file:
```bash
REACT_APP_API_BASE_URL=http://localhost
```

### 4. Ensure Dependencies
All required dependencies are already in `package.json`:
- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `chart.js` & `react-chartjs-2` - Charts
- `framer-motion` - Animations
- `react` & `react-dom` - Core React

---

## Component Architecture

### State Management
- **Revenue Metrics:** `revenueMetrics` (today, week, month, year)
- **Order Metrics:** `orderMetrics` (today, total)
- **Customer Metrics:** `customerMetrics` (active, total)
- **Service Health:** `serviceHealth` (status per service)
- **Queue Metrics:** `queueMetrics` (queue lengths)
- **Compliance:** `complianceMetrics` (age verification, COA, licenses)
- **Customer Intel:** `customerIntel` (acquisition, membership)
- **Alerts:** `alerts` (inventory, licenses, transactions, system)

### Data Fetching Functions
```javascript
fetchBigQueryData()          // Revenue and customer data
fetchHistoricalData()        // 7-day trends
fetchProductData()           // Top products
fetchServiceHealth()         // All 6 services health
fetchComplianceData()        // Compliance metrics (mock)
fetchCustomerIntelligence()  // Customer intel (mock)
fetchInventoryAlerts()       // Low stock alerts (mock)
fetchTransactionAlerts()     // Failed transactions (mock)
```

### Refresh Mechanism
```javascript
// Auto-refresh every 30 seconds
useEffect(() => {
  if (!autoRefresh) return;
  const interval = setInterval(() => {
    fetchAllData();
  }, REFRESH_INTERVAL);
  return () => clearInterval(interval);
}, [autoRefresh, fetchAllData]);
```

---

## Styling & Design

### Color Palette
- **Primary Green:** `#16A34A` (success, revenue, positive metrics)
- **Warning Orange:** `#F59E0B` (alerts, moderate status)
- **Blue:** `#3B82F6` (informational, neutral metrics)
- **Purple:** `#8B5CF6` (special metrics, highlights)
- **Red:** `#EF4444` (errors, critical alerts)

### Card Design
- Dark gradient backgrounds: `#1E293B` to `#334155`
- Subtle borders: `rgba(148, 163, 184, 0.1)`
- Smooth animations with Framer Motion
- Responsive grid layout with Material-UI Grid

### Charts
- **Line Chart:** Revenue trend over 7 days
- **Doughnut Chart:** Customer acquisition sources
- **Bar Chart:** Membership tier distribution

---

## Customization Guide

### Adding New Metrics
1. Add state variable:
```javascript
const [myMetric, setMyMetric] = useState(0);
```

2. Create fetch function:
```javascript
const fetchMyMetric = async () => {
  const response = await fetch(`${BASE_URL}:PORT/api/endpoint`);
  const data = await response.json();
  setMyMetric(data.value);
};
```

3. Add to `fetchAllData()`:
```javascript
await Promise.all([
  // ... existing fetches
  fetchMyMetric(),
]);
```

4. Display in UI:
```javascript
<MetricCard
  title="My Metric"
  value={myMetric}
  icon={<MyIcon />}
  color="#16A34A"
/>
```

### Adding New Services
Add to `SERVICES` array:
```javascript
const SERVICES = [
  // ... existing services
  { name: 'My Service', port: 3006, key: 'myservice' },
];
```

Service will automatically appear in health monitoring section.

### Customizing Alerts
Modify alert fetch functions to match your business logic:
```javascript
const fetchInventoryAlerts = async () => {
  // Fetch from your inventory API
  const response = await fetch(`${BASE_URL}:3002/api/inventory/low-stock`);
  const data = await response.json();

  // Map to alert format
  setAlerts(prev => ({
    ...prev,
    inventory: data.map(item => ({
      message: `Low stock: ${item.name} (${item.quantity} remaining)`,
      severity: item.quantity < 5 ? 'error' : 'warning',
    })),
  }));
};
```

---

## Performance Considerations

### Optimization Strategies
1. **Polling Interval:** Set to 30 seconds by default. Adjust `REFRESH_INTERVAL` constant.
2. **Parallel Fetching:** All data fetches run in parallel via `Promise.all()`
3. **Error Boundaries:** Component handles errors gracefully without crashing
4. **Conditional Rendering:** Charts only render when data is available
5. **Memo/Callback:** Uses `useCallback` for stable function references

### Network Optimization
- Services timeout after 5 seconds (AbortSignal)
- Failed fetches don't block other data
- Stale data displayed while refreshing

---

## Testing Checklist

### Manual Testing
- [ ] Dashboard loads without errors
- [ ] All metrics display correctly
- [ ] Revenue data updates from BigQuery
- [ ] All 6 services show health status
- [ ] Charts render properly
- [ ] Auto-refresh toggles on/off
- [ ] Manual refresh button works
- [ ] Alerts display when present
- [ ] Responsive on mobile/tablet
- [ ] Loading states appear smoothly

### API Testing
```bash
# Test BigQuery endpoints
curl http://localhost:3005/api/bigquery/dashboard
curl http://localhost:3005/api/bigquery/historical
curl http://localhost:3005/api/bigquery/products

# Test service health
curl http://localhost:3005/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:3002/health
```

---

## Future Enhancements

### Phase 2 Features
1. **Real Compliance API:** Connect to actual cannabis-service compliance endpoints
2. **Real Inventory API:** Integrate with product-service inventory tracking
3. **Transaction Monitoring:** Connect to payment-service for real transaction status
4. **Historical Trends:** Add 30-day and 90-day trend views
5. **Export Reports:** PDF/Excel export of dashboard data
6. **Alert Notifications:** Push notifications or email alerts
7. **User Preferences:** Customize which metrics to display
8. **Drill-down Views:** Click metrics to see detailed breakdowns

### Advanced Analytics
1. **Predictive Analytics:** ML-based revenue forecasting
2. **Customer Segmentation:** RFM analysis and cohort tracking
3. **Product Performance:** SKU-level analytics
4. **Geographic Analysis:** Revenue by state/region
5. **Time-series Analysis:** Seasonal trends and patterns

---

## Troubleshooting

### Common Issues

**Dashboard doesn't load:**
- Check all backend services are running
- Verify CORS configuration allows frontend origin
- Check browser console for errors

**Metrics show zero:**
- Verify BigQuery sync is enabled
- Check authentication tokens are valid
- Ensure Square data is syncing properly

**Charts don't render:**
- Verify chart.js and react-chartjs-2 are installed
- Check browser console for Chart.js errors
- Ensure data arrays are not empty

**Services show offline:**
- Verify all services are running on correct ports
- Check health endpoints return 200 status
- Review service logs for errors

---

## Support & Maintenance

### Monitoring
- Dashboard auto-refreshes every 30 seconds
- Service health checked on each refresh
- Errors logged to browser console

### Logging
Component logs errors to console:
```javascript
console.error('BigQuery fetch error:', err);
console.error('Historical data fetch error:', err);
console.error('Product data fetch error:', err);
```

### Updates
When backend APIs change:
1. Update API endpoint URLs in component
2. Update data mapping logic in fetch functions
3. Test all metrics display correctly
4. Update this README with changes

---

## Credits

Built for LivHana Empire - Executive Intelligence & Operations Command Center

**Technology Stack:**
- React 18.2
- Material-UI 5.14
- Chart.js 4.5
- Framer Motion 10.16
- BigQuery Integration
- RESTful APIs

**Integration Points:**
- Integration Service (BigQuery, Square)
- Cannabis Compliance Service
- Payment Processing Service
- Voice AI Service
- Reasoning Gateway
- Product Management Service

<!-- Last verified: 2025-10-02 -->
