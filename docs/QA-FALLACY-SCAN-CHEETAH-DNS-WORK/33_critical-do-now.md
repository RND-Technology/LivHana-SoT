### 🚨 CRITICAL (Do NOW):

1. **Rotate GoDaddy API Credentials**
   ```bash
   # Generate new key at: https://developer.godaddy.com/keys
   op item edit "GoDaddy API Key" --vault "LivHana-Ops-Keys" \
       GODADDY_API_KEY[text]=NEW_KEY \
       GODADDY_API_SECRET[password]=NEW_SECRET
   ```

2. **Delete Hardcoded Files**
   ```bash
   rm scripts/godaddy-dns-final.sh
   rm scripts/godaddy-dns-mission-accomplish.sh
   git status  # Verify NOT tracked
   ```

3. **Verify Current Domains Still Work**
   ```bash
   for domain in $(cat docs/domains/domains-requiring-dns.txt); do
       dig +short "$domain" | grep -q "34.143" && echo "✅ $domain" || echo "❌ $domain"
   done
   ```
