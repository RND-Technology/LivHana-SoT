### How We Handle Infinite Context

**The Problem:**

- Claude has 200K token context limit
- Your business has YEARS of context
- Can't send everything every time

**The Solution: Smart Context Retrieval**

```javascript
async function getRelevantContext(query, customerId) {
  // 1. Semantic search (finds relevant, not just keyword match)
  const relevant = await vectorSearch(query, {
    sources: ['notion', 'gmail', 'code', 'interactions'],
    limit: 100  // Top 100 most relevant pieces
  });

  // 2. Customer-specific context
  const customerContext = await memoryEngine.getProfile(customerId);

  // 3. Business rules that always apply
  const businessRules = await getRequiredBusinessRules();

  // 4. Combine intelligently (prioritize by relevance)
  const context = {
    // ALWAYS INCLUDED (5K tokens)
    businessRules,
    customerProfile: customerContext,

    // RELEVANT TO THIS QUERY (150K tokens available)
    relevant: relevant.topMatches,

    // METADATA for additional retrieval if needed
    available: relevant.allMatches.map(m => m.id)
  };

  return context;
}
```

**Result:** Claude always has the MOST RELEVANT context, not ALL context. But can retrieve more if needed during the conversation.

---
