### **CONDITIONAL YES: Add N8N to Liv Hana Stack**

**Conditions**:

1. ✅ **Use for marketing/ops workflows** (Pilot Training, feedback, HNC, merchant onboarding)
2. ❌ **DON'T use for core product logic** (LSS, COA validation, payments, self-healing)
3. ✅ **Self-host on GCP** (avoid SaaS costs)
4. ✅ **Follow governance rules** (keep simple, version control, monitor, exit strategy)
5. ✅ **Commit to 5+ workflows** (otherwise not worth setup cost)

**ROI**:

- **Year 1**: -$2,700 (negative, but investment in tooling)
- **Year 2+**: +$3,300/year (positive if we use it heavily)
- **Payback**: 14 months

**Risk Mitigation**:

- Monthly cost/benefit review (kill if not valuable)
- Quarterly migration check (move critical workflows to code if needed)
- Strict governance (prevent workflow spaghetti)

**When to Revisit Decision**:

- If team grows to 10+ people (non-engineers need workflows) → N8N becomes more valuable
- If Jesse is coding everything solo → N8N might slow him down, skip it
- If we launch 10+ workflows and they're stable → N8N pays for itself

---
