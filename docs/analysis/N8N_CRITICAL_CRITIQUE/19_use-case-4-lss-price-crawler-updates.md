### **Use Case 4: LSS Price Crawler Updates** ⭐⭐⭐

**Workflow**:

```
Cron trigger (every 6 hours) →
Fetch prices from 50 merchant sites →
Parse HTML/API responses →
Update price database →
If price drop >10%: Send alert to members
```

**Why N8N Could Work**:

- Scheduled triggers
- Multiple API calls
- Database updates

**Why Code Might Be Better**:

- Complex parsing logic (HTML scraping = fragile)
- Performance matters (50 sites × every 6 hours = need speed)
- Error handling (sites go down, HTML changes)

**Verdict**: N8N MAYBE. If merchants have clean APIs, N8N works. If we're scraping HTML, code is better. **TEST FIRST.**

---
