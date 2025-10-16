### KAJA Gateway (Authorize.Net)

The system uses Authorize.Net for recurring billing with cannabis compliance:

1. **Subscription Creation:**
   - Customer payment method is tokenized
   - Recurring subscription created with monthly interval
   - First charge processed immediately

2. **Recurring Billing:**
   - Automatic monthly charges on billing date
   - Failed payments trigger retry logic (handled by gateway)
   - Customer notified of payment failures

3. **Proration:**
   - Upgrades charge the difference immediately
   - Full new price charged on next billing cycle
