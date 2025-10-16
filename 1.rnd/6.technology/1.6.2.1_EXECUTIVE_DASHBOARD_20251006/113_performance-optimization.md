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
