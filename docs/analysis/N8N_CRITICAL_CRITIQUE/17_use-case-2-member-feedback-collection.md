### **Use Case 2: Member Feedback Collection** ⭐⭐⭐⭐⭐

**Workflow**:

```
Member makes purchase →
Wait 3 days (delivery time) →
Send survey email ("How was Cheetah Piss?") →
If completed: Add $10 to cashback wallet + store feedback in BigQuery →
If NOT completed: Send reminder (7 days) →
If still not completed: Manual follow-up
```

**Why N8N Wins**:

- Time-based triggers (wait 3 days, wait 7 days)
- Email + database + payment integration
- Easy to tweak timing/copy
- Non-engineers can monitor (see which members haven't responded)

**Alternative (Code)**:

- Would take 6-8 hours to code (cron jobs, email templates, database writes)
- Harder to modify timing (need to redeploy)

**Verdict**: N8N saves 70% time here. **USE IT.**

---
