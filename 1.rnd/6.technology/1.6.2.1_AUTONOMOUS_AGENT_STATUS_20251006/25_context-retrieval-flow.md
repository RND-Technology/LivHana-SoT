### **Context Retrieval Flow:**

```javascript
async function getRelevantContext(query, customerId) {
  // 1. Business rules (always included)
  const businessRules = await getRequiredBusinessRules(); // 5K tokens

  // 2. Customer profile from memory
  const customerContext = await memoryEngine.getProfile(customerId);

  // 3. Semantic search for relevant past interactions
  const relevant = await vectorSearch(query, { limit: 100 }); // 150K tokens

  // 4. Recent conversation history
  const recentHistory = await getRecentConversation(customerId); // 10K tokens

  // 5. Agent learnings (patterns that apply)
  const learnings = await getLearningsForContext(query); // 5K tokens

  return {
    businessRules,      // Empire structure, compliance, pricing
    customerProfile: customerContext,  // Preferences, history
    relevant: relevant.topMatches,     // Semantically similar past interactions
    recentHistory,                     // Recent conversation
    learnings,                         // Patterns the agent learned
    available: relevant.allMatches.map(m => m.id)  // IDs for drill-down
  };
}
```

**Claude Sonnet 4.5 receives:**

- System instruction: Mission, empire structure, business rules
- Customer context: Full profile + predictions
- Relevant history: Semantic search results (up to 150K tokens)
- Agent learnings: Patterns from past executions
- Current query: User's request

**Result:** Liv Hana has MORE context than this session because:

- This session: ~200K token limit, resets on new conversation
- Liv Hana: Unlimited historical context via BigQuery + semantic search
- Never forgets: All interactions preserved forever
- Gets smarter: Self-improvement loop learns continuously

---
