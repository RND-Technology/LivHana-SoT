### Phase 3: Scale (Week 3-4)

**Prototype 5: Voice-to-Purchase**
```javascript
// File: backend/reasoning-gateway/src/voice-commerce.js

class VoiceCommerceEngine {
  async processVoiceCommand(audioBuffer, customerId) {
    // Transcribe audio
    const transcript = await this.deepgram.transcribe(audioBuffer);

    // Extract intent
    const intent = await this.claude.analyze(transcript, {
      customer_profile: await this.profiles.get(customerId),
      context: 'voice_commerce',
      possible_intents: ['reorder', 'new_purchase', 'question', 'feedback']
    });

    // Execute action
    if (intent.type === 'reorder') {
      const product = intent.product;
      const order = await this.lightspeed.createOrder(customerId, product);
      return { success: true, order, message: `Ordered ${product.name}` };
    }

    // ... handle other intents
  }
}
```

**Deliverable**: Voice command → Product purchase pipeline
**Test**: "I need more sleep gummies" → Order created
**Handoff**: API + voice examples + error handling

---
