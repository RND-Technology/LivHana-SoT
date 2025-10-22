### For Team

1. **DNS apex records require special handling**
   - Cannot use CNAME
   - Must use A, AAAA, ALIAS, or ANAME

2. **Cloud Run IP addresses are dynamic**
   - 8 IPs for load distribution
   - IPs may change during updates
   - CNAME to service name is preferred (but only for subdomains)

3. **API success != correct configuration**
   - GoDaddy silently fixed the invalid request
   - Always verify actual DNS records

---
