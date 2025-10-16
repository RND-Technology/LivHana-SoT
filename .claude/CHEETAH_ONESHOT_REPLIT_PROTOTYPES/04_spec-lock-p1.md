### Spec Lock (P1)
```yaml
# specs/lightspeed-bigquery.spec.yaml
openapi: 3.1.0
paths:
  /sync/sales:
    post:
      summary: Sync Lightspeed sales to BigQuery
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  inserted:
                    type: integer
                  lastSync:
                    type: string

# Invariants:
# - All sales must have timestamp
# - Customer ID can be null (anonymous)
# - Product ID must exist
# - Price must be positive
# - Insert must be idempotent (no duplicates)

# Threat Model:
# - Duplicate sales (retry logic)
# - Missing fields (null handling)
# - Large batches (memory limits)
# - BigQuery rate limits
```
