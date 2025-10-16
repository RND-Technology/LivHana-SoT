### API Keys & Credentials

```bash
# Store in 1Password
op item create \\
  --category=password \\
  --title="NOTION_API_KEY" \\
  --vault="LivHana-Ops-Keys" \\
  password="secret_xxxxx"

# Reference in .env
NOTION_API_KEY=op://LivHana-Ops-Keys/NOTION_API_KEY/password

# Gmail OAuth tokens
op item create \\
  --category=document \\
  --title="Gmail OAuth Token" \\
  --vault="LivHana-Ops-Keys" \\
  "gmail_token.json"="<file_contents>"
```
