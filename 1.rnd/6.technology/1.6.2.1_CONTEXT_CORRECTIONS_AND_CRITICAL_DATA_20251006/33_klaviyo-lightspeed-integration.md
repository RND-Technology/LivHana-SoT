### Klaviyo + LightSpeed Integration

**You asked:** "how to bring list into Klaviyo and set it up with LightSpeed, Leafly"

**Strategy:**

1. **Export from Square:**

   ```bash
   # Use square_ingest_all.ts to get customer emails
   # Already done: 11,348 customers in BigQuery
   ```

2. **Import to Klaviyo:**
   - CSV export from BigQuery
   - Klaviyo bulk import
   - Tag customers by purchase history

3. **LightSpeed → Klaviyo sync:**
   - Use Klaviyo's LightSpeed integration
   - Auto-sync new customers
   - Trigger abandoned cart emails

4. **Leafly integration:**
   - Sync menu from LightSpeed
   - Update deals automatically
   - Track referrals from Leafly

---
