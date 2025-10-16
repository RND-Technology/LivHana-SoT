### 2. Monitor Progress (Polling)

```bash
while true; do
  STATUS=$(curl -s http://localhost:4002/api/autonomous/tasks/$TASK_ID \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.status')

  echo "Status: $STATUS"

  if [[ "$STATUS" == "pending_approval" ]] || [[ "$STATUS" == "completed" ]] || [[ "$STATUS" == "failed" ]]; then
    break
  fi

  sleep 5
done
```
