### Prometheus + Grafana (Optional)

If you want to visualize Prometheus metrics:

1. Install Grafana:

```bash
docker run -d -p 3000:3000 grafana/grafana
```

2. Configure Prometheus data source in Grafana

3. Import pre-built Node.js dashboard
