#### TIER 2: UNTESTED ERROR SCENARIOS (5% Coverage)

1. **Network Failures**
   - ❌ API timeout handling
   - ❌ Connection refused scenarios
   - ❌ Partial response handling
   - ❌ Retry logic verification

2. **Authentication Failures**
   - ⚠️ Invalid token (tested in e2e-full-system.spec.ts)
   - ❌ Expired token
   - ❌ Missing auth header
   - ❌ Token refresh flow
   - ❌ 401 redirect behavior

3. **Data Validation Failures**
   - ❌ Malformed request payloads
   - ❌ Missing required fields
   - ❌ Invalid data types
   - ❌ Schema validation errors

4. **Rate Limiting**
   - ❌ Rate limit detection
   - ❌ Retry-After header handling
   - ❌ Backoff strategy

5. **External Service Failures**
   - ❌ Square API down
   - ❌ BigQuery unavailable
   - ❌ ElevenLabs API errors
   - ❌ Email service failures
