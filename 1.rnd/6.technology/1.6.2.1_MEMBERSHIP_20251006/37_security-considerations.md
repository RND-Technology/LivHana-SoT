## Security Considerations

1. **JWT Authentication:** All endpoints require valid JWT
2. **Admin Endpoints:** Stats endpoint restricted to admin role
3. **PCI Compliance:** Payment methods tokenized, no card data stored
4. **Data Encryption:** All data encrypted at rest in BigQuery
5. **Audit Logging:** All membership changes logged with user context
