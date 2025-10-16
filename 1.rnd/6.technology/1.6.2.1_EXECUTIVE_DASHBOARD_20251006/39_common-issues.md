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
