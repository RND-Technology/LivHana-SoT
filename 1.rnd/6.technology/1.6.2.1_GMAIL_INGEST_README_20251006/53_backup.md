### Backup

```bash
# Export BigQuery tables
bq extract \
  --destination_format=AVRO \
  communications.gmail_messages \
  gs://livhana-backups/gmail/messages_$(date +%Y%m%d).avro

# Backup tokens (encrypted)
tar czf gmail_tokens_backup.tar.gz .gmail_sync_*.json gmail_token_*.json
gpg --encrypt --recipient your-email@example.com gmail_tokens_backup.tar.gz
```
