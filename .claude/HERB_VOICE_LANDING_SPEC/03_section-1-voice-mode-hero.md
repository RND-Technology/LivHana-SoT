## 🎤 SECTION 1: VOICE MODE HERO

```html
<section class="hero-voice">
  <div class="container">
    <h1>Talk to HERB</h1>
    <p class="tagline">AI-Powered Voice Reasoning for Cannabis & Wellness</p>

    <!-- VOICE INTERFACE -->
    <div class="voice-container">
      <div class="voice-visualizer" id="waveform">
        <!-- Animated waveform when speaking -->
        <canvas id="audioWave"></canvas>
      </div>

      <button class="voice-button" id="voiceBtn">
        <i class="icon-microphone"></i>
        <span>Click to Speak</span>
      </button>

      <div class="voice-status">
        <span id="status">Ready to listen...</span>
      </div>

      <!-- CONVERSATION DISPLAY -->
      <div class="conversation-log">
        <div class="message user">
          <span class="avatar">👤</span>
          <div class="text">What are the best products for sleep?</div>
        </div>

        <div class="message herb">
          <span class="avatar">🌿</span>
          <div class="text">
            Based on customer data, these 3 products have 91% satisfaction for sleep:
            <ul>
              <li>Blue Dream CBN Gummies (87% repeat purchase)</li>
              <li>Midnight Indica Flower (92% positive reviews)</li>
              <li>Sleep Tincture 2:1 CBD:CBN (89% effectiveness)</li>
            </ul>
            Would you like to try a sample pack?
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div class="quick-actions">
      <button class="action-btn">Product Recommendations</button>
      <button class="action-btn">Inventory Check</button>
      <button class="action-btn">Sales Analysis</button>
      <button class="action-btn">Customer Insights</button>
    </div>
  </div>
</section>
```

---
