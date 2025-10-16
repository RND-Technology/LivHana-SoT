### Top Senders

```sql
SELECT * FROM `communications.gmail_top_senders`
WHERE account_email = 'jesseniesen@gmail.com'
ORDER BY email_count DESC
LIMIT 20;
```
