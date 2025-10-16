#### Execute Approved Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals/{proposalId}/execute
```
