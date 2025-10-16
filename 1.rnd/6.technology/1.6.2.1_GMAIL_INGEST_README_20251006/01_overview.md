## Overview

This pipeline ingests emails from multiple Gmail accounts into BigQuery for analysis, compliance tracking, and business intelligence.

**Accounts:**

- `jesseniesen@gmail.com` - Primary CEO account
- `high@reggieanddro.com` - R&D TX operations

**Features:**

- OAuth 2.0 authentication with automatic token refresh
- Multi-account support with 1Password integration
- Pagination for 1000+ emails per account
- Full content extraction (HTML → plain text, attachments)
- Thread relationship tracking
- BigQuery storage with full-text search
- Smart filtering and category detection
- Deduplication and incremental sync
- Rate limiting and exponential backoff
- Business intelligence extraction
- PII detection and masking
- Cloud Storage for attachments
