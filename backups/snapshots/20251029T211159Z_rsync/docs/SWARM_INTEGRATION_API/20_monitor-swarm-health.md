### Monitor Swarm Health

```bash
# Continuous monitoring
watch -n 5 'curl -s http://localhost:8080/api/swarm/health | jq .'
```
