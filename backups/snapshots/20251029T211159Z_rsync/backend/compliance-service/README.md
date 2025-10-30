# Liv Hana Compliance Service

---
**Last Audited:** 2025-10-29
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** 2025-11-28 (30 days)
---


**Version:** 1.0.0  
**Status:** Production Ready  
**Compliance:** AGE21 + NIST + Medical Claims + LifeWard Principle  

---

## Overview

Unified REST API for cannabis compliance verification:

1. **Age Verification** - 21+ enforcement
2. **NIST Validation** - Approved cannabinoid methods
3. **Medical Claims Blocker** - FDA compliance
4. **Comprehensive Checks** - Combined validation

---

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run API server
python api.py

# Server will start on http://localhost:8000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:8000/health
```

### Cloud Run Deployment

```bash
# Build and deploy to Google Cloud Run
gcloud run deploy compliance-service \
  --source . \
  --region us-central1 \
  --project reggieanddrodispensary \
  --allow-unauthenticated
```

---

## API Endpoints

### Health Check

```bash
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "service": "compliance-service",
  "version": "1.0.0",
  "features": ["age_verification", "nist_validation", "medical_claims_blocker"],
  "timestamp": "2025-10-21T12:00:00Z"
}
```

### Age Verification

```bash
POST /api/v1/verify-age
Content-Type: application/json

{
  "birthdate": "2000-01-01"
}
```

**Response:**

```json
{
  "allowed": true,
  "age": 25,
  "reason": "age_ok:25",
  "timestamp": "2025-10-21T12:00:00Z",
  "compliance": {
    "age21_enforced": true,
    "lifeward_principle": true,
    "threshold": 21
  }
}
```

### NIST Cannabinoid Validation

```bash
POST /api/v1/validate-cannabinoid
Content-Type: application/json

{
  "cannabinoid": "THC"
}
```

**Response:**

```json
{
  "valid": true,
  "cannabinoid": "THC",
  "reason": "nist_ok:THC",
  "timestamp": "2025-10-21T12:00:00Z",
  "compliance": {
    "nist_validated": true,
    "novel_cannabinoid_gate": true,
    "lifeward_principle": true
  }
}
```

### Medical Claims Check

```bash
POST /api/v1/check-medical-claims
Content-Type: application/json

{
  "text": "This product may help with relaxation and wellness"
}
```

**Response:**

```json
{
  "allowed": true,
  "flags": [],
  "timestamp": "2025-10-21T12:00:00Z",
  "compliance": {
    "no_medical_claims": true,
    "lifeward_principle": true,
    "fda_compliance": true
  },
  "severity": "OK"
}
```

### Comprehensive Compliance Check

```bash
POST /api/v1/comprehensive-check
Content-Type: application/json

{
  "birthdate": "2000-01-01",
  "cannabinoids": ["THC", "CBD"],
  "content": "Natural wellness product for relaxation"
}
```

**Response:**

```json
{
  "overall_compliant": true,
  "age_check": {
    "allowed": true,
    "age": 25,
    "reason": "age_ok:25"
  },
  "nist_check": {
    "results": [
      {"cannabinoid": "THC", "valid": true, "reason": "nist_ok:THC"},
      {"cannabinoid": "CBD", "valid": true, "reason": "nist_ok:CBD"}
    ],
    "all_valid": true
  },
  "medical_claims_check": {
    "allowed": true,
    "flags": []
  },
  "timestamp": "2025-10-21T12:00:00Z",
  "compliance_score": 1.0
}
```

---

## Integration Examples

### Python

```python
import requests

# Age verification
response = requests.post(
    "http://localhost:8000/api/v1/verify-age",
    json={"birthdate": "2000-01-01"}
)
print(response.json())

# Comprehensive check
response = requests.post(
    "http://localhost:8000/api/v1/comprehensive-check",
    json={
        "birthdate": "2000-01-01",
        "cannabinoids": ["THC", "CBD"],
        "content": "Natural wellness product"
    }
)
print(response.json())
```

### JavaScript

```javascript
// Age verification
const response = await fetch("http://localhost:8000/api/v1/verify-age", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ birthdate: "2000-01-01" })
});
const data = await response.json();
console.log(data);
```

### curl

```bash
# Age verification
curl -X POST http://localhost:8000/api/v1/verify-age \
  -H "Content-Type: application/json" \
  -d '{"birthdate":"2000-01-01"}'

# NIST validation
curl -X POST http://localhost:8000/api/v1/validate-cannabinoid \
  -H "Content-Type: application/json" \
  -d '{"cannabinoid":"THC"}'

# Medical claims check
curl -X POST http://localhost:8000/api/v1/check-medical-claims \
  -H "Content-Type: application/json" \
  -d '{"text":"Natural wellness product"}'
```

---

## Configuration

See `config/compliance_guardrails.json` for detailed configuration options:

- Age verification thresholds
- NIST-approved cannabinoid list
- Medical claims block patterns
- PII protection settings
- Brand protection rules
- Regulatory compliance by jurisdiction

---

## Testing

### Unit Tests

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=. --cov-report=html
```

### Manual Testing

```bash
# Test age verification (under 21 - should fail)
curl -X POST http://localhost:8000/api/v1/verify-age \
  -H "Content-Type: application/json" \
  -d '{"birthdate":"2010-01-01"}'

# Test invalid cannabinoid (should fail)
curl -X POST http://localhost:8000/api/v1/validate-cannabinoid \
  -H "Content-Type: application/json" \
  -d '{"cannabinoid":"UNKNOWN"}'

# Test medical claim (should fail)
curl -X POST http://localhost:8000/api/v1/check-medical-claims \
  -H "Content-Type: application/json" \
  -d '{"text":"This product cures cancer"}'
```

---

## Deployment

### Local Deployment

```bash
# Start service
python api.py

# Service runs on port 8000
```

### Docker Deployment

```bash
# Build image
docker build -t compliance-service .

# Run container
docker run -p 8000:8000 compliance-service
```

### Cloud Run Deployment

```bash
# Deploy to Google Cloud Run
gcloud run deploy compliance-service \
  --source . \
  --region us-central1 \
  --project reggieanddrodispensary \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

---

## Monitoring

### Health Checks

```bash
# Check service health
curl http://localhost:8000/health

# Expected response
{
  "status": "healthy",
  "service": "compliance-service",
  "version": "1.0.0"
}
```

### Logs

```bash
# View logs (Docker)
docker logs livhana-compliance-service

# View logs (Cloud Run)
gcloud run services logs read compliance-service \
  --region us-central1 \
  --project reggieanddrodispensary
```

---

## Compliance Principles

### LifeWard Standard

- Prioritize human life and safety in all decisions
- No shortcuts on compliance or safety

### AGE21 Enforcement

- Strict 21+ age verification
- No exceptions or grace periods
- Multiple verification methods supported

### NIST Methods

- Only NIST-approved cannabinoids allowed
- Lab certification required
- Novel cannabinoid gate active

### No Medical Claims

- Cannabis is NOT medicine
- Block therapeutic language
- FDA disclaimer required

### Brand Protection

- Reggie & Dro are brands only
- No character usage in medical contexts
- Trademark enforcement active

---

## Support

- **Documentation:** `/docs` (FastAPI auto-generated)
- **Health Check:** `/health`
- **OpenAPI Spec:** `/openapi.json`

---

**Status:** ✅ Production Ready  
**Compliance:** ✅ AGE21 | ✅ NIST | ✅ Medical Claims | ✅ LifeWard  
**Deployment:** ✅ Local | ✅ Docker | ✅ Cloud Run
