### Scenario: Customer asks "What do you recommend for anxiety?"

**What Happens (Behind the Scenes):**

```javascript
// 1. Retrieve context (parallel, < 100ms total)
const context = {
  customer: {
    name: "Sarah",
    previousPurchases: [
      { product: "Lavender Jack 3.5g", date: "2025-09-15", rating: 5 },
      { product: "Cheetah Piss 3.5g", date: "2025-09-01", rating: 4 }
    ],
    preferences: {
      effects: ["relaxing", "anxiety-relief"],
      avoidEffects: ["energizing"],
      budget: "$40-60 per purchase"
    },
    medicalNeeds: ["anxiety", "occasional insomnia"],
    lastConversation: "2 weeks ago, asked about sleep aids"
  },

  businessRules: [
    "Always verify 21+ age before purchase",
    "Recommend Indica for anxiety",
    "Mention Gold membership 30% discount",
    "Check COA certificates are current"
  ],

  currentInventory: [
    { name: "Lavender Jack", price: 45, stock: 12, effects: ["relaxing", "anxiety-relief"] },
    { name: "Banana Pancakes", price: 52.50, stock: 8, effects: ["relaxing", "sleep"] },
    { name: "Cheetah Piss", price: 55, stock: 5, effects: ["energizing", "focus"] }
  ],

  similarConversations: [
    "Customer #423 asked about anxiety, we recommended Lavender Jack, 5-star review",
    "Customer #891 similar profile, loved Banana Pancakes for anxiety + sleep"
  ]
};

// 2. Build context-rich prompt
const prompt = `
You are Liv Hana for Reggie & Dro.

CUSTOMER PROFILE:
Sarah, Gold member (30% discount), previous purchases: Lavender Jack (loved it, 5 stars),
Cheetah Piss (good, 4 stars). Medical needs: anxiety, occasional insomnia.
Budget: $40-60. Last talked 2 weeks ago about sleep aids.

BUSINESS RULES:
- Verify age 21+
- Recommend Indica for anxiety
- Mention Gold membership discount
- Check COA current

CURRENT INVENTORY:
- Lavender Jack: $45, 12 in stock, effects: relaxing, anxiety-relief
- Banana Pancakes: $52.50, 8 in stock, effects: relaxing, sleep
- Cheetah Piss: $55, 5 in stock, effects: energizing, focus

SIMILAR SUCCESS STORIES:
- Customer #423: Lavender Jack for anxiety → 5-star review
- Customer #891 (similar to Sarah): Banana Pancakes for anxiety + sleep

CUSTOMER QUERY: "What do you recommend for anxiety?"

Provide personalized recommendation using ALL context above.
`;

// 3. Claude responds with FULL context awareness
const response = await claude.generate(prompt);

// Response (what customer sees):
"Hey Sarah! Great to hear from you again. For your anxiety, I'd absolutely
recommend **Lavender Jack** – you gave it 5 stars last time and it's perfect
for relaxation. We have 12 units in stock at $45, but with your Gold membership,
that's only **$31.50** (30% off)!

I also noticed you mentioned sleep issues last time. If you want something that
helps with both anxiety AND sleep, check out **Banana Pancakes** ($52.50, or
$36.75 with your discount). Customers with similar needs to yours have loved it.

Both have current COA certificates and are 100% compliant. Want me to add one
to your cart?"

// 4. Learn from interaction
await memoryEngine.learn({
  customer: "Sarah",
  query: "anxiety recommendation",
  response: "Lavender Jack + Banana Pancakes",
  reasoning: "Previous 5-star + addressing sleep concern",
  outcome: "customer added Lavender Jack to cart" // tracked later
});
```

**THIS IS WHAT "SAME CONTEXT" MEANS.**

---
