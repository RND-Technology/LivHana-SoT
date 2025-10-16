### **Anti-Use Case 4: Financial Transactions (Cashback Payouts)** ❌

**Why NOT N8N**:

- High stakes (money movement = can't afford bugs)
- Needs transactional integrity (database + payment API must be atomic)
- Regulatory compliance (audit trails, PCI requirements)
- N8N doesn't handle transactions well

**Verdict**: Payment logic = CODE ONLY (use Stripe SDK directly). N8N too risky.

---
