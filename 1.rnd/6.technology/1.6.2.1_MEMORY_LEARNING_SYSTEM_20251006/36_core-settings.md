### Core Settings

```bash
# Redis connection
MEMORY_REDIS_URL=redis://localhost:6379

# Encryption (32-byte hex key)
MEMORY_ENCRYPTION_KEY=your-64-character-hex-key

# TTL settings
MEMORY_PROFILE_TTL_DAYS=2555  # 7 years (cannabis regulation)
SESSION_TTL_SECONDS=3600
AUDIT_LOG_TTL_DAYS=2555

# Feature flags
ENABLE_MEMORY_LEARNING=true
ENABLE_BIGQUERY_MEMORY=true
ENABLE_VECTOR_EMBEDDINGS=true
```
