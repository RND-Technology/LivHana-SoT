### Search All Emails

```sql
SELECT
  message_id,
  account_email,
  subject,
  from_email,
  timestamp,
  snippet
FROM `communications.gmail_messages`
WHERE
  SEARCH(body_text, 'cannabis license')
  AND is_spam = FALSE
ORDER BY timestamp DESC
LIMIT 100;
```
