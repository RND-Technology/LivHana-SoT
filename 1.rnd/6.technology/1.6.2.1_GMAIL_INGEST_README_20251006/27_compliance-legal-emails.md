### Compliance & Legal Emails

```sql
SELECT * FROM `communications.gmail_compliance_legal`
WHERE has_attachments = TRUE
ORDER BY timestamp DESC;
```
