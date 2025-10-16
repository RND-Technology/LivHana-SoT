### 4.1 Missing Features (Non-Critical)

1. **Product Inventory Deduction**
   - **Current State:** Inventory synced every 15 minutes from POS
   - **Gap:** No real-time inventory check at checkout
   - **Risk:** Overselling low-stock items (15-minute window)
   - **Recommendation:** Add real-time Square API call at checkout confirmation
   - **Priority:** Medium (mitigated by POS enforcement)

2. **Customer Lifetime Value (LTV) Calculation**
   - **Current State:** Simplified LTV = Avg Revenue * 12 months
   - **Gap:** No cohort analysis, retention curves, or churn modeling
   - **Recommendation:** Implement cohort-based LTV with retention curves
   - **Priority:** Low (current calculation sufficient for MVP)

3. **Membership Downgrade Flow**
   - **Current State:** Customer must cancel + re-subscribe for downgrade
   - **Gap:** No seamless downgrade path (UX friction)
   - **Recommendation:** Add PUT /api/memberships/:id/downgrade endpoint
   - **Priority:** Low (rare use case)

4. **Raffle Runner-Up Notifications**
   - **Current State:** Runner-up prizes tracked but no automated emails
   - **Gap:** Manual notification process
   - **Recommendation:** Add email notification on draw completion
   - **Priority:** Medium (enhances customer experience)

5. **Vector Search for Products**
   - **Current State:** Vector embeddings infrastructure exists
   - **Gap:** Product semantic search not fully integrated
   - **Recommendation:** Complete /api/memory/vector/search implementation
   - **Priority:** Medium (enables "show me something for sleep" queries)

---
