### Reasoning Engine (Backend)
```javascript
// File: backend/reasoning-gateway/src/herb-reasoning.js

class HerbReasoningEngine {
  async processQuery(query, userId) {
    // 1. Get user context
    const userProfile = await this.getUserProfile(userId);

    // 2. Analyze query intent
    const intent = await this.analyzeIntent(query);

    // 3. Fetch relevant data
    const data = await this.gatherData(intent, userProfile);

    // 4. Generate reasoning
    const reasoning = await this.claude.complete({
      model: 'claude-sonnet-4-5',
      messages: [{
        role: 'user',
        content: `
          User Query: "${query}"
          User Profile: ${JSON.stringify(userProfile)}
          Available Data: ${JSON.stringify(data)}

          Provide a helpful, data-driven response with specific product recommendations.
          Include confidence scores and reasoning.
        `
      }]
    });

    // 5. Format response
    return {
      response: reasoning.content,
      confidence: 0.92,
      data_sources: ['lightspeed', 'bigquery', 'customer_reviews'],
      recommendations: this.extractRecommendations(reasoning)
    };
  }
}
```
