### DATA MOAT SCORE (DMS) FORMULA

**DMS = interactions × label-quality × reuse rate**

**Interaction Definition:**
One interaction = One complete user engagement session containing:

1. User input (query/action)
2. AI response (generated output)
3. User feedback (explicit or implicit)
4. Context retained (conversation history)
5. Outcome tracked (goal achieved/failed)

**Quality Gates:**

- Source: AlloyDB interactions table
- Validation: Must have all 5 components
- Quality gate: User satisfaction score >3.5/5
- Exclusions: Bot traffic, test accounts, errors

**TARGET MILESTONES:**

- Month 6: 50,000 interactions (DMS ≥ 250K)
- Month 12: 100,000 interactions (DMS ≥ 2M)
- Month 18: 200,000 interactions (DMS ≥ 5M)
