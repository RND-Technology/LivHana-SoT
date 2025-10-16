### Redis

```bash
# Check connectivity
redis-cli ping

# Get queue length
redis-cli LLEN bull:voice-mode-reasoning-jobs:wait

# Clear failed jobs
redis-cli DEL bull:voice-mode-reasoning-jobs:failed
```
