### Store Securely

```bash
# Add to 1Password
op item create \
  --category=password \
  --title="ELEVENLABS_API_KEY" \
  --vault="LivHana-Ops-Keys" \
  password="<key_value>"

# Reference in .env
ELEVENLABS_API_KEY=op://LivHana-Ops-Keys/ELEVENLABS_API_KEY/password
```

---
