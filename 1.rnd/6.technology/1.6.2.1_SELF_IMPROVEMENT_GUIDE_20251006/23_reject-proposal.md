#### Reject Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not needed right now"}' \
  http://localhost:4002/api/improvements/proposals/{proposalId}/reject
```
