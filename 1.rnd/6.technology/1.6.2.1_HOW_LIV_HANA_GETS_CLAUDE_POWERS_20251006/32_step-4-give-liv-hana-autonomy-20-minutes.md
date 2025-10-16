### Step 4: Give Liv Hana Autonomy (20 minutes)

```bash
# Add to Liv Hana's prompt (reasoning-gateway)
# Now Liv Hana can execute tasks autonomously

# Test with customer query
curl -X POST http://localhost:4002/api/reasoning \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add a new strain called Purple Haze to our catalog",
    "metadata": {"autonomousMode": true}
  }'

# Liv Hana will:
# 1. Understand the request
# 2. Check your product schema
# 3. Generate the code
# 4. Run tests
# 5. Ask for approval
# 6. Deploy when approved
```
