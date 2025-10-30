#### **Task 3: Domain Mapping**

**When:** After services deployed

**Domains to Map:**

- `delivery.reggieanddro.com` → delivery-service
- `voice.reggieanddro.com` → voice-service

**Commands:**

```bash
gcloud run domain-mappings create \
  --service delivery-service \
  --domain delivery.reggieanddro.com \
  --region us-central1

gcloud run domain-mappings create \
  --service voice-service \
  --domain voice.reggieanddro.com \
  --region us-central1
```
