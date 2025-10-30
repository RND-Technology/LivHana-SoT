#### Why This is Invalid

**DNS RFC 1034 Section 3.6.2:**
> "If a CNAME RR is present at a node, no other data should be present; this ensures that the data for a canonical name and its aliases cannot be different."

**Problem:** Root domains (@) MUST have:

- NS records (nameserver delegation)
- SOA records (zone authority)
- Often: MX, TXT, etc.

**CNAME cannot coexist with these required records.**
