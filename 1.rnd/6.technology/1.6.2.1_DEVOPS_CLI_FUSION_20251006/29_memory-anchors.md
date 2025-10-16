## MEMORY ANCHORS

**Key Files:**

- Source: `docs/incoming/2025-10-03/CLAUDE_CODE_CLI_IMPLEMENTATION_GUIDE.md`
- Fusion: `docs/fusion/devops/DEVOPS_CLI_FUSION.md` (this file)
- Task 1A-1C: LightSpeed customization prompts (lines 29-190 of source)
- Task 2A-2B: Square API integration prompts (lines 192-501 of source)
- Task 3A: Email automation setup (lines 504-643 of source)
- Task 4A: Analytics dashboard architecture (lines 645-814 of source)

**Dependencies:**

- Backend codebase: `/backend/` or `/empire/` (Trinity architecture)
- Database: Cloud SQL (PostgreSQL) for transactional + BigQuery for analytics
- LightSpeed credentials: 1Password `op://livhana/reggieanddro` OR manual admin access
- Square API token: 1Password `op://livhana/square-reggieanddro` (verify scopes)
- SendGrid API key: 1Password `op://livhana/sendgrid` OR provision new

**Translation Requirements:**

- All "Flask microservice" tasks → Extend existing Trinity backend (Node.js or Python)
- All "PostgreSQL" references → Cloud SQL (for transactional) + BigQuery (for analytics)
- All "LightSpeed API" tasks → Manual theme editor (until API confirmed)
- All "custom React dashboard" tasks → Looker Studio + BigQuery

---
