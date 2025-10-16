### Recent Important Emails

```sql
SELECT * FROM `communications.gmail_recent_important`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY sender_score DESC, timestamp DESC;
```
