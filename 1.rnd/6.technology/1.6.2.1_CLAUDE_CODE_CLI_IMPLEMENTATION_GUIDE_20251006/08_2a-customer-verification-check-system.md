### 2A: Customer Verification Check System

**Claude Code Prompt:**

```
You are building a customer verification status checker for a hemp e-commerce platform.

BUSINESS CONTEXT:
- Company: Reggie & Dro (Texas legal hemp retailer)
- Compliance requirement: Age/ID verification before shipping (Veriff system)
- Problem: Want to accept orders immediately, verify post-purchase to reduce friction
- Current system: Veriff for ID verification, custom membership agreement, email opt-ins

SYSTEM ARCHITECTURE:

**Database (PostgreSQL):**
- Table: customer_verification
- Fields: customer_email (PK), veriff_approved (bool), veriff_date (timestamp), membership_signed (bool), membership_date (timestamp), email_optin (bool), optin_date (timestamp)

**API Requirements:**
1. Check verification status by email/phone
2. Return: veriff_approved, membership_signed, email_optin (all booleans + dates)
3. Fast response time (<100ms)
4. Error handling for missing customers (return all false)
5. Logging for audit trail

**Integration Points:**
- LightSpeed checkout webhook (order.created event)
- Square API (customer data sync)
- Veriff API (verification status updates)

**Use Case Flow:**
1. Customer completes checkout on LightSpeed
2. Webhook triggers verification check API
3. API queries database for customer_email
4. Returns verification status
5. If all true → process order immediately
6. If any false → flag order, trigger email sequence (72-hour countdown)

TECHNICAL SPECS:
- Language: Python 3.9+ (Flask microservice)
- Database: PostgreSQL 13+
- Authentication: API key-based (separate keys for LightSpeed, Square, internal)
- Rate limiting: 100 requests/minute per API key
- Response format: JSON
- CORS: Enabled for reggieanddro.company.site domain only
- SSL: Required (HTTPS only)

ENDPOINTS TO CREATE:

**1. Check Verification Status**
```

POST /api/v1/customer/check-verification
Headers: X-API-Key: [key]
Body:
{
  "email": "<customer@example.com>",
  "phone": "+12345678900" (optional)
}

Response:
{
  "customer_found": true,
  "veriff_approved": true,
  "veriff_date": "2024-09-15T14:32:00Z",
  "membership_signed": true,
  "membership_date": "2024-09-15T14:35:00Z",
  "email_optin": true,
  "optin_date": "2024-09-15T14:35:00Z",
  "all_verified": true
}

```

**2. Update Verification Status**
```

POST /api/v1/customer/update-verification
Headers: X-API-Key: [key]
Body:
{
  "email": "<customer@example.com>",
  "verification_type": "veriff" | "membership" | "email_optin",
  "status": true,
  "metadata": {
    "ip_address": "1.2.3.4",
    "user_agent": "...",
    "verification_id": "..." (for Veriff)
  }
}

Response:
{
  "success": true,
  "message": "Verification status updated",
  "customer_email": "<customer@example.com>",
  "updated_field": "veriff_approved",
  "timestamp": "2024-09-15T14:32:00Z"
}

```

**3. Bulk Verification Status**
```

POST /api/v1/customer/bulk-check
Headers: X-API-Key: [key]
Body:
{
  "emails": ["customer1@example.com", "customer2@example.com", ...]
}

Response:
{
  "results": [
    {
      "email": "customer1@example.com",
      "all_verified": true,
      ...
    },
    ...
  ],
  "total_checked": 50,
  "fully_verified_count": 42,
  "partially_verified_count": 8
}

```

SECURITY REQUIREMENTS:
- SQL injection prevention (parameterized queries only)
- Rate limiting (Redis-backed)
- API key rotation support
- Audit logging (all requests logged with timestamp, IP, user agent)
- GDPR compliance (PII handling rules)
- Error messages sanitized (no database structure leakage)

ERROR HANDLING:
- 400: Invalid request format
- 401: Invalid API key
- 404: Customer not found (return default false response, don't error)
- 429: Rate limit exceeded
- 500: Database connection error (retry logic)

DELIVERABLES:
1. Flask API service (app.py with blueprints)
2. Database schema (migrations using Alembic)
3. API documentation (Swagger/OpenAPI spec)
4. Unit tests (pytest, >80% coverage)
5. Deployment config (Docker + docker-compose.yml)
6. Environment variables template (.env.example)
7. Monitoring setup (Sentry error tracking)

Build a production-ready API with comprehensive error handling, logging, and documentation. Include setup instructions for local development and deployment to Heroku or Google Cloud Run.
```

**Expected Output:** Complete API service with tests and deployment config

---
