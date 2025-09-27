### CONFIGURATION TEMPLATES

.env keys:
- OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_ENDPOINT
- DATABASE_URL, REDIS_URL
- OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET

Kubernetes Values (snippet):
```yaml
image:
  repository: ghcr.io/org/app
  tag: sha-<commit>
resources:
  requests: { cpu: "200m", memory: "256Mi" }
  limits:   { cpu: "1",    memory: "1Gi" }
env:
  - name: DATABASE_URL
    valueFrom: secretKeyRef: { name: app-secrets, key: database_url }
```

