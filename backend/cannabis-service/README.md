# Cannabis Compliance Service

## Overview
Handles all cannabis-related compliance, age verification, and regulatory requirements.

## API Endpoints
- `POST /api/verify/age` - Age gate verification
- `GET /api/compliance/status` - Compliance status check
- `POST /api/compliance/validate` - Validate transaction compliance

## Environment Variables
- `COMPLIANCE_API_KEY` - API key for compliance checks
- `MIN_AGE` - Minimum age requirement (default: 21)

## Testing
```bash
npm test
```
