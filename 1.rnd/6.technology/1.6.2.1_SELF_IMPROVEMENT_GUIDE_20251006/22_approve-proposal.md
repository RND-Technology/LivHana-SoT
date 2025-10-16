#### Approve Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"autoExecute": true}' \
  http://localhost:4002/api/improvements/proposals/{proposalId}/approve
```
