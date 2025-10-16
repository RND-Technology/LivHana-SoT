### Find Emails with Attachments

```sql
SELECT
  m.message_id,
  m.subject,
  m.from_email,
  m.timestamp,
  ARRAY_AGG(a.filename) as attachments
FROM `communications.gmail_messages` m
JOIN `communications.gmail_attachments` a
  ON m.message_hash = a.message_hash
WHERE m.account_email = 'jesseniesen@gmail.com'
GROUP BY m.message_id, m.subject, m.from_email, m.timestamp
ORDER BY m.timestamp DESC;
```
