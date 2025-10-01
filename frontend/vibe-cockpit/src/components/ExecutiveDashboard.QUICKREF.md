# Executive Dashboard - Quick Reference Card

## 📊 Component Overview

**Location:** `/frontend/vibe-cockpit/src/components/ExecutiveDashboard.jsx`
**Lines:** 1,137
**Size:** 34KB
**Auto-Refresh:** Every 30 seconds

---

## 🚀 Quick Start

```bash
# 1. Add import to App.jsx
import ExecutiveDashboard from './components/ExecutiveDashboard';

# 2. Add route
<Route path="/executive" element={<ExecutiveDashboard />} />

# 3. Navigate to
http://localhost:5173/executive
```

---

## 📈 Key Metrics Displayed

### Revenue Section
- **Today's Revenue** - Last 24 hours
- **Week Revenue** - Last 7 days
- **Month Revenue** - Last 30 days
- **Year Revenue** - Total YTD

### Operations Section
- **Orders Today** - Count of today's orders
- **Active Customers** - Unique customers
- **Avg Order Value** - Calculated from BigQuery
- **Active Alerts** - Total system alerts

---

## 🔌 API Endpoints

### BigQuery (Port 3005)
```
GET /api/bigquery/dashboard    → Main metrics
GET /api/bigquery/historical   → 7-day trends
GET /api/bigquery/products     → Product catalog
```

### Service Health (All Services)
```
GET http://localhost:3005/health  → Integration
GET http://localhost:3003/health  → Cannabis
GET http://localhost:3004/health  → Payment
GET http://localhost:4001/health  → Voice
GET http://localhost:4002/health  → Reasoning
GET http://localhost:3002/health  → Product
```

---

## 🎨 Component Structure

```javascript
ExecutiveDashboard
├── Header (Title, Last Update, Refresh Button)
├── Revenue Metrics (4 cards)
├── Operations Metrics (4 cards)
├── Revenue Trend Chart (Line chart)
├── Service Health Monitor (6 services)
├── Compliance Dashboard (Progress bars)
├── Customer Intelligence (2 charts)
│   ├── Acquisition Sources (Doughnut)
│   └── Membership Tiers (Bar)
├── Top Products (Grid of product cards)
└── Alerts Section (4 categories)
    ├── Low Inventory
    ├── Expiring Licenses
    ├── Failed Transactions
    └── System Errors
```

---

## 🎯 State Variables

```javascript
// Loading & Error
loading, error, lastUpdate, autoRefresh

// Revenue & Orders
revenueMetrics {today, week, month, year}
orderMetrics {today, total}
customerMetrics {active, total}
avgOrderValue

// Products
topProducts [...]

// Services
serviceHealth {...}
queueMetrics {...}

// Compliance
complianceMetrics {
  ageVerificationRate,
  coaValidationRate,
  activeLicenses,
  expiringLicenses
}

// Intelligence
customerIntel {
  acquisitionSources,
  membershipTiers
}

// Alerts
alerts {inventory, licenses, transactions, system}

// Historical
revenueHistory [...]
```

---

## 🛠️ Key Functions

```javascript
fetchBigQueryData()          → Revenue/customer data
fetchHistoricalData()        → 7-day revenue trend
fetchProductData()           → Top products
fetchServiceHealth()         → All services status
fetchComplianceData()        → Compliance metrics
fetchCustomerIntelligence()  → Customer data
fetchInventoryAlerts()       → Low stock warnings
fetchTransactionAlerts()     → Failed transactions
fetchAllData()               → Calls all above in parallel
```

---

## 🎨 Color Palette

```javascript
Green:  #16A34A  → Success, revenue, positive
Orange: #F59E0B  → Warnings, moderate status
Blue:   #3B82F6  → Informational metrics
Purple: #8B5CF6  → Special metrics
Red:    #EF4444  → Errors, critical alerts
```

---

## 📱 Responsive Breakpoints

```javascript
xs={12}       → Mobile (full width)
sm={6}        → Tablet (half width)
md={3} md={4} → Desktop (quarter/third)
lg={6}        → Large desktop (half)
```

---

## ⚙️ Configuration Constants

```javascript
// Adjust these in ExecutiveDashboard.jsx

const REFRESH_INTERVAL = 30000;  // 30 seconds
const BASE_URL = 'http://localhost';

const SERVICES = [
  { name: 'Integration', port: 3005, key: 'integration' },
  { name: 'Cannabis', port: 3003, key: 'cannabis' },
  { name: 'Payment', port: 3004, key: 'payment' },
  { name: 'Voice', port: 4001, key: 'voice' },
  { name: 'Reasoning', port: 4002, key: 'reasoning' },
  { name: 'Product', port: 3002, key: 'product' },
];
```

---

## 🔧 Common Customizations

### Change Refresh Interval
```javascript
const REFRESH_INTERVAL = 60000; // 60 seconds
```

### Add New Service
```javascript
const SERVICES = [
  // ... existing services
  { name: 'My Service', port: 3006, key: 'myservice' },
];
```

### Add New Metric Card
```javascript
<MetricCard
  title="My Metric"
  value={formatNumber(myValue)}
  icon={<MyIcon />}
  color="#16A34A"
  trend="up"
  trendValue="+15%"
/>
```

---

## 🐛 Debug Checklist

### Dashboard Won't Load
- ✅ Check Integration Service running on 3005
- ✅ Verify CORS allows `localhost:5173`
- ✅ Check browser console for errors

### Metrics Show $0
- ✅ BigQuery sync enabled?
- ✅ Check `.env` has `BIGQUERY_ENABLED=true`
- ✅ Verify Google Cloud credentials

### Services Show Offline
- ✅ Start all services
- ✅ Check ports not in use
- ✅ Test health endpoints with curl

### Charts Don't Render
- ✅ `npm list chart.js react-chartjs-2`
- ✅ Clear browser cache
- ✅ Check console for Chart.js errors

---

## 📦 Dependencies

```json
{
  "@mui/material": "^5.14.20",
  "@mui/icons-material": "^5.14.19",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "framer-motion": "^10.16.4"
}
```

---

## 🎬 Quick Test Commands

```bash
# Test all service health
for port in 3005 3003 3004 4001 4002 3002; do
  echo "Testing port $port..."
  curl -s http://localhost:$port/health | jq
done

# Test BigQuery endpoints
curl http://localhost:3005/api/bigquery/dashboard | jq
curl http://localhost:3005/api/bigquery/historical | jq
curl http://localhost:3005/api/bigquery/products | jq

# Start frontend
cd frontend/vibe-cockpit
npm run dev
```

---

## 📊 Dashboard Sections Summary

| Section | Data Source | Update Frequency |
|---------|------------|------------------|
| Revenue Metrics | BigQuery | 30s |
| Operations | BigQuery | 30s |
| Service Health | Health endpoints | 30s |
| Compliance | Mock (future: cannabis-service) | 30s |
| Customer Intel | Mock (future: analytics) | 30s |
| Top Products | BigQuery | 30s |
| Alerts | Multiple sources | 30s |

---

## 🚨 Alert Severities

```javascript
'error'   → Red background, critical action needed
'warning' → Orange background, attention required
'info'    → Blue background, informational only
```

---

## 💡 Pro Tips

1. **Toggle Auto-Refresh** - Click the chip in header to disable
2. **Manual Refresh** - Click refresh icon anytime
3. **Responsive Test** - Resize browser to see mobile layout
4. **Console Logging** - Open DevTools to see API responses
5. **Mock Data** - Some features use mock data until APIs ready

---

## 📚 Additional Docs

- **Full Documentation:** `ExecutiveDashboard.README.md`
- **Integration Guide:** `EXECUTIVE_DASHBOARD_INTEGRATION.md`
- **Component Code:** `ExecutiveDashboard.jsx`

---

## 🎯 Key Metrics for Success

- **Load Time:** < 2 seconds
- **API Response:** < 500ms
- **Service Uptime:** > 99.9%
- **Data Accuracy:** 100%
- **Auto-Refresh:** Working reliably

---

## 🔥 Hot Keys

- `Ctrl/Cmd + R` - Manual browser refresh
- `F12` - Open DevTools
- `Ctrl/Cmd + Shift + C` - Inspect element

---

## 📞 Quick Reference URLs

```
Dashboard:     http://localhost:5173/executive
Integration:   http://localhost:3005
Cannabis:      http://localhost:3003
Payment:       http://localhost:3004
Voice:         http://localhost:4001
Reasoning:     http://localhost:4002
Product:       http://localhost:3002
```

---

**Last Updated:** October 1, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
