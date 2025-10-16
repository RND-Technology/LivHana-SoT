### 2. Storage Layer (`age_verification_store.js`)

**Responsibilities:**

- Store verification records in BigQuery
- Maintain audit log (all attempts)
- In-memory caching (1-hour TTL)
- Rate limiting (3 attempts per 24 hours)
- Statistics for admin dashboard
- Mock mode for development

**BigQuery Tables:**

**Table 1: `commerce.age_verifications`**

- Stores successful verifications
- 1-year expiration per record
- Partitioned by date
- Clustered by customer_id_hash, state
- 7-year retention policy

**Table 2: `commerce.age_verification_attempts`**

- Complete audit log (all attempts)
- IP address and user agent captured
- Partitioned by date
- Clustered by customer_id_hash, created_at
- 7-year retention policy

**Caching Strategy:**

- In-memory Map() for verification results
- 1-hour TTL
- Automatic expiration check
- Cache hit rate target: > 80%

**Rate Limiting:**

- In-memory Map() for attempt tracking
- 3 attempts per customer per 24 hours
- Automatic cleanup of old attempts
- Clear error messages with reset time
