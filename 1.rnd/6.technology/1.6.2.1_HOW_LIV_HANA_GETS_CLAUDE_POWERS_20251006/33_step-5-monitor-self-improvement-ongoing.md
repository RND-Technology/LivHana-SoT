### Step 5: Monitor Self-Improvement (ongoing)

```bash
# Check what Liv Hana learned today
curl http://localhost:4002/api/improvements/metrics \
  -H "Authorization: Bearer $ADMIN_JWT"

# See proposed improvements
curl http://localhost:4002/api/improvements/proposals \
  -H "Authorization: Bearer $ADMIN_JWT"

# Approve low-risk improvements
curl -X POST http://localhost:4002/api/improvements/proposals/{id}/approve \
  -H "Authorization: Bearer $ADMIN_JWT"
```

---
