### 2.1 Customer Data Models

**Customer Profile Schema:**

```javascript
// Unified customer profile (common/memory/learning-engine.js:102-148)
{
  customerId: STRING (unique identifier),
  version: STRING (profile version),

  // Preferences
  preferences: {
    categories: ARRAY<STRING> (preferred product categories),
    priceRange: { min: FLOAT, max: FLOAT },
    flavors: ARRAY<STRING> (preferred flavors/terpenes),
    effects: ARRAY<STRING> (desired effects)
  },

  // Behavioral tracking
  behavioral: {
    totalPurchases: INTEGER,
    totalSpent: FLOAT (lifetime value),
    averageOrderValue: FLOAT,
    purchaseFrequency: STRING (weekly, monthly, etc.),
    lastPurchaseDate: TIMESTAMP,
    favoriteProducts: ARRAY<STRING>
  },

  // Conversation tracking
  conversationHistory: {
    totalInteractions: INTEGER,
    lastInteractionDate: TIMESTAMP,
    topics: ARRAY<STRING> (discussed topics),
    recentConversations: ARRAY<Object> (last 10)
  },

  // Communication preferences
  communication: {
    preferredChannel: STRING (email, phone, chat),
    responseStyle: STRING (detailed, concise),
    engagement: FLOAT (0-1, engagement score)
  },

  // Predictive analytics
  predictions: {
    churnRisk: FLOAT (0-1),
    nextPurchaseDate: TIMESTAMP (estimated),
    recommendedProducts: ARRAY<STRING>
  },

  // Compliance
  ageVerification: {
    verified: BOOLEAN,
    verificationDate: TIMESTAMP,
    verificationMethod: STRING,
    expiresAt: TIMESTAMP
  },

  // Membership
  membership: {
    tier: STRING (BRONZE, SILVER, GOLD),
    status: STRING (active, cancelled),
    discountPercent: INTEGER,
    startDate: TIMESTAMP,
    nextBillingDate: TIMESTAMP
  }
}
```

**Data Consistency Guarantees:**

1. **Profile Updates:** Atomic writes to BigQuery with versioning
2. **Interaction Logging:** Batch inserts with flush interval (30s)
3. **Purchase Recording:** Immediate write with event acknowledgment
4. **Prediction Tracking:** Timestamped predictions with accuracy updates

**Integrity Checks:**

```javascript
// Pre-insert validation (common/memory/learning-engine.js:234-267)
- customerId must be non-empty string
- timestamps must be valid ISO 8601
- numeric fields must be within bounds (0-1 for probabilities)
- required fields checked before BigQuery insert
- JSON schema validation for complex objects
```

---
