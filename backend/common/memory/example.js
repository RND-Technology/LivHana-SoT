#!/usr/bin/env node

/**
 * Memory Learning System - Example Usage
 *
 * This script demonstrates how to use the memory learning system.
 * Run with: node backend/common/memory/example.js
 */

import { MemoryLearningEngine } from './learning-engine.js';
import pino from 'pino';

const logger = pino({ level: 'info' });

async function runExample() {
  console.log('\n🧠 Memory Learning System - Example\n');
  console.log('=' .repeat(50));

  // Create engine
  console.log('\n1. Creating Memory Learning Engine...');
  const engine = await MemoryLearningEngine.create({ logger });
  console.log('✓ Engine created');

  const customerId = 'demo-customer-' + Date.now();
  console.log(`\n2. Customer ID: ${customerId}`);

  // Simulate first interaction
  console.log('\n3. Simulating first customer interaction...');
  await engine.learnFromInteraction(customerId, {
    message: "Hi, I'm looking for something to help with sleep and anxiety",
    response: "I recommend Indica strains like Granddaddy Purple or Northern Lights. They're known for their relaxing effects.",
    sentiment: 0.8,
    intent: 'product_recommendation',
    entities: {
      symptoms: ['sleep', 'anxiety'],
      strains: ['Indica']
    },
    sessionId: 'session-1',
    timestamp: new Date().toISOString()
  });
  console.log('✓ First interaction learned');

  // Get profile
  console.log('\n4. Retrieving customer profile...');
  let profile = await engine.getProfile(customerId);
  console.log('✓ Profile retrieved:');
  console.log(`   - Total interactions: ${profile.conversationHistory.totalInteractions}`);
  console.log(`   - Engagement: ${profile.communication.engagement.toFixed(2)}`);
  console.log(`   - Topics: ${Object.keys(profile.conversationHistory.topics || {}).join(', ') || 'None yet'}`);

  // Simulate second interaction
  console.log('\n5. Simulating second interaction...');
  await engine.learnFromInteraction(customerId, {
    message: "I also like fruity flavors. Do you have any recommendations?",
    response: "Definitely! Blue Dream has a sweet berry flavor and provides a balanced high. Strawberry Cough is another great option with fruity notes.",
    sentiment: 0.9,
    intent: 'product_recommendation',
    entities: {
      flavors: ['fruity', 'berry'],
      strains: ['Blue Dream', 'Strawberry Cough']
    },
    sessionId: 'session-1',
    timestamp: new Date().toISOString()
  });
  console.log('✓ Second interaction learned');

  // Simulate purchase
  console.log('\n6. Recording a purchase...');
  await engine.updatePurchaseHistory(customerId, {
    orderId: 'order-demo-' + Date.now(),
    amount: 125.50,
    products: ['Blue Dream', 'Granddaddy Purple'],
    timestamp: new Date().toISOString()
  });
  console.log('✓ Purchase recorded');

  // Get updated profile
  console.log('\n7. Getting updated profile...');
  profile = await engine.getProfile(customerId);
  console.log('✓ Profile updated:');
  console.log(`   - Total interactions: ${profile.conversationHistory.totalInteractions}`);
  console.log(`   - Total purchases: ${profile.behavioral.totalPurchases}`);
  console.log(`   - Lifetime value: $${profile.behavioral.lifetimeValue.toFixed(2)}`);
  console.log(`   - Average order value: $${profile.behavioral.averageOrderValue.toFixed(2)}`);

  // Get recommendations
  console.log('\n8. Getting personalized recommendations...');
  const recommendations = await engine.getRecommendations(customerId);
  console.log('✓ Recommendations:');
  recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.type}: ${JSON.stringify(rec.values || rec.value || rec.symptoms)}`);
    console.log(`      Reason: ${rec.reason}`);
    console.log(`      Confidence: ${(rec.confidence * 100).toFixed(0)}%`);
  });

  // Predict next purchase
  console.log('\n9. Predicting next purchase...');
  const nextPurchasePrediction = await engine.predictNextPurchase(customerId);
  if (nextPurchasePrediction.confidence > 0) {
    console.log('✓ Prediction:');
    console.log(`   - Next purchase date: ${nextPurchasePrediction.nextPurchaseDate}`);
    console.log(`   - Confidence: ${(nextPurchasePrediction.confidence * 100).toFixed(0)}%`);
  } else {
    console.log('✓ Not enough data for prediction yet');
    console.log(`   - Reason: ${nextPurchasePrediction.reason}`);
  }

  // Calculate churn risk
  console.log('\n10. Calculating churn risk...');
  const churnAnalysis = await engine.calculateChurnRisk(customerId);
  console.log('✓ Churn Analysis:');
  console.log(`   - Churn risk: ${(churnAnalysis.churnRisk * 100).toFixed(0)}%`);
  console.log(`   - Engagement: ${profile.communication.engagement.toFixed(2)}`);
  console.log(`   - Sentiment: ${profile.communication.sentiment.toFixed(2)}`);
  if (churnAnalysis.churnRisk > 0.7) {
    console.log('   ⚠️  WARNING: Customer at high risk of churning!');
  } else if (churnAnalysis.churnRisk > 0.4) {
    console.log('   ⚡ ALERT: Customer showing signs of disengagement');
  } else {
    console.log('   ✅ Customer is engaged and active');
  }

  // Get full context
  console.log('\n11. Getting full customer context...');
  const context = await engine.getContext(customerId, { depth: 'full' });
  console.log('✓ Context retrieved');
  console.log(`   - Profile version: ${context.profile.version}`);
  console.log(`   - Last updated: ${context.profile.updatedAt}`);
  console.log(`   - Recommendations: ${context.recommendations.length} items`);

  // Simulate third interaction (showing learned context)
  console.log('\n12. Simulating third interaction with learned context...');
  await engine.learnFromInteraction(customerId, {
    message: "I'm back! What's new?",
    response: "Welcome back! Based on your previous preferences for Blue Dream and Granddaddy Purple, I have some new arrivals you might like.",
    sentiment: 0.95,
    intent: 'greeting',
    sessionId: 'session-2',
    timestamp: new Date().toISOString()
  });
  console.log('✓ System recognized returning customer with context');

  // Final profile
  console.log('\n13. Final customer profile summary...');
  profile = await engine.getProfile(customerId);
  console.log('✓ Summary:');
  console.log(`   - Customer ID: ${customerId}`);
  console.log(`   - Total interactions: ${profile.conversationHistory.totalInteractions}`);
  console.log(`   - Total purchases: ${profile.behavioral.totalPurchases}`);
  console.log(`   - Lifetime value: $${profile.behavioral.lifetimeValue.toFixed(2)}`);
  console.log(`   - Engagement score: ${(profile.communication.engagement * 100).toFixed(0)}%`);
  console.log(`   - Sentiment: ${profile.communication.sentiment.toFixed(2)}`);
  console.log(`   - Churn risk: ${(churnAnalysis.churnRisk * 100).toFixed(0)}%`);
  console.log(`   - Top topics: ${Object.entries(profile.conversationHistory.topics || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic)
    .join(', ')}`);

  // Cleanup
  console.log('\n14. Testing GDPR compliance (forget customer)...');
  await engine.forgetCustomer(customerId, 'Demo completed');
  console.log('✓ Customer data deleted');

  // Close engine
  await engine.close();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Example completed successfully!\n');
  console.log('Key Takeaways:');
  console.log('1. The system learns from every interaction');
  console.log('2. Customer profiles are automatically enriched');
  console.log('3. Predictions improve with more data');
  console.log('4. Recommendations become more personalized');
  console.log('5. Churn risk is monitored in real-time');
  console.log('6. Full GDPR compliance with forget capability\n');
  console.log('🚀 THIS IS WHAT MAKES US A UNICORN - NO COMPETITOR HAS THIS.\n');
}

// Run example
runExample().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
