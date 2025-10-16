### **Use Case 2: Bug Detection → Auto-Fix**

**System:** Daily cron detects error spike in logs

**Self-Improvement Loop:**

1. Analyzes errors (finds JWT validation failing)
2. Root cause: JWT_SECRET not loaded from env
3. Proposes fix: Add env validation at startup
4. Generates implementation plan
5. Creates fix + tests
6. Submits for approval
7. Deploys on approval

**Time:** 1 hour (vs 4-8 hours manual detection + fix)
