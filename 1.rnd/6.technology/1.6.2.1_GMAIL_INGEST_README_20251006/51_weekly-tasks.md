### Weekly Tasks

```bash
# Verify data integrity
node gmail_test.js

# Check sync state
for f in .gmail_sync_*.json; do
  echo "$f:"
  jq . "$f"
done
```
