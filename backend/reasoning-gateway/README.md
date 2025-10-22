# Reasoning Gateway

SI Recommendation Engine + Voice Commerce Engine

## Services

### SI Recommendations (Port 8082)

Collaborative filtering recommendations

### Voice Commerce (Port 8083)

Voice command to purchase using Claude AI

## Deploy

```bash
# Deploy SI Recommendations
gcloud run deploy si-recommendations \
  --source . \
  --region us-central1 \
  --port 8082 \
  --set-env-vars="SERVICE=si-recommendations"

# Deploy Voice Commerce
gcloud run deploy voice-commerce \
  --source . \
  --region us-central1 \
  --port 8083 \
  --set-env-vars="SERVICE=voice-commerce,ANTHROPIC_API_KEY=xxx"
```
