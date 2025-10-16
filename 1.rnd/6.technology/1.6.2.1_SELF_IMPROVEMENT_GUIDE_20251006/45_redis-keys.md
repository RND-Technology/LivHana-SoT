### Redis Keys

```bash
# All proposals
redis-cli KEYS "improvement:proposal:*"

# Proposals summary
redis-cli GET "improvement:proposals:summary"

# Knowledge base entries
redis-cli KEYS "knowledge:*"
```
