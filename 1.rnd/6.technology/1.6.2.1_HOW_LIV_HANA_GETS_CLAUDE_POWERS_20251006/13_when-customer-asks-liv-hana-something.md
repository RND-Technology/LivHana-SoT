### When Customer Asks Liv Hana Something

**Step 1: Context Retrieval (< 100ms)**

```javascript
// Gather ALL relevant context
const context = {
  // Customer history
  customer: await memoryEngine.getProfile(customerId),

  // Recent conversations
  conversations: await getRecentConversations(customerId, 30),

  // Business rules from Notion
  businessRules: await searchNotion('compliance rules'),

  // Similar past interactions
  similar: await vectorSearch(customerQuery),

  // Current inventory/pricing
  products: await bigquery.query('SELECT * FROM products'),

  // Relevant code if technical
  code: await searchCodebase(keywords)
};
```

**Step 2: Context Injection**

```javascript
// Build mega-prompt with ALL context
const prompt = `
You are Liv Hana, the AI assistant for Reggie & Dro.

=== CUSTOMER CONTEXT ===
${context.customer.fullProfile}

=== CONVERSATION HISTORY ===
${context.conversations}

=== BUSINESS RULES ===
${context.businessRules}

=== CURRENT INVENTORY ===
${context.products}

=== CUSTOMER QUERY ===
${customerQuery}

Using ALL the above context, provide the best possible response.
Remember everything from past conversations and apply all business rules.
`;
```

**Step 3: Claude Processes with Full Context**

```javascript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 8000,
  thinking: { type: 'enabled', budget_tokens: 10000 },
  messages: [{ role: 'user', content: prompt }]
});
```

**Step 4: Learn from Interaction**

```javascript
// Store what worked for next time
await memoryEngine.learnFromInteraction(customerId, {
  query: customerQuery,
  response: response.content,
  sentiment: analyzeSentiment(response),
  outcome: 'success'
});
```

---
