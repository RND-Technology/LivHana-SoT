#### Evidence

```python
# godaddy-dns-bulk-automation.py:181-209 (29 domains configured)
E2E_EMPIRE_DNS_CONFIG = {
    "aaacbdhempflower.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    # ... 28 more domains with same INVALID config
}
```

```bash
# godaddy-dns-automation-working.sh:102-107
dns_record=$(jq -n --arg target "$target" '[{
    "type": "CNAME",
    "name": "@",
    "data": $target,
    "ttl": 300
}]')
```

```bash
# godaddy-dns-mission-accomplish.sh:75-78
updated_records=$(echo "$existing_records" | jq --arg target "$target" '
    map(select(.type != "A" or .name != "@")) +
    [{type: "CNAME", name: "@", data: $target, ttl: 600}]
')
```
