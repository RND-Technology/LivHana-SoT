### 4.3 Test Secret Access

```bash
# Test 1Password access
op read 'op://LivHana-Trinity-Local Development/GITHUB_TOKEN/password'

# Test environment loading
source .env
echo $GITHUB_TOKEN
```
