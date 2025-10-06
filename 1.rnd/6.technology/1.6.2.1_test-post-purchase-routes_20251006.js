#!/usr/bin/env node
/**
 * Test Post-Purchase Verification Routes
 * Run: node backend/integration-service/test-post-purchase-routes.js
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3005';
const TESTS = [];

function test(name, fn) {
  TESTS.push({ name, fn });
}

async function runTests() {
  console.log('🧪 Testing Post-Purchase Verification Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const { name, fn } of TESTS) {
    try {
      console.log(`\n▶ ${name}`);
      await fn();
      console.log(`✅ PASS`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}`);
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Test 1: Webhook - Create new order
test('POST /api/v1/post-purchase/webhook - Create new order', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/post-purchase/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'order.created',
      orderId: 'TEST-001',
      customerId: 'CUST-001',
      customerEmail: 'test@example.com',
      orderTotal: 75.00,
      createdAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.success) throw new Error('Response success = false');
  if (data.orderId !== 'TEST-001') throw new Error('Order ID mismatch');
  if (data.status !== 'pending_verification') throw new Error('Status mismatch');
  if (!data.deadline) throw new Error('Missing deadline');

  console.log(`   Order ID: ${data.orderId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Deadline: ${data.deadline}`);
});

// Test 2: Status check
test('GET /api/v1/post-purchase/status/:orderId - Check order status', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/post-purchase/status/TEST-001`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.success) throw new Error('Response success = false');
  if (data.orderId !== 'TEST-001') throw new Error('Order ID mismatch');
  if (data.status !== 'pending_verification') throw new Error('Status should be pending');
  if (data.hoursRemaining <= 0) throw new Error('Hours remaining should be > 0');

  console.log(`   Status: ${data.status}`);
  console.log(`   Hours Remaining: ${data.hoursRemaining}`);
});

// Test 3: Verify order
test('POST /api/v1/post-purchase/verify - Complete verification', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/post-purchase/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'TEST-001',
      customerEmail: 'test@example.com',
      ageVerified: true,
      membershipOptIn: true,
      verificationMethod: 'veriff'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.success) throw new Error('Response success = false');
  if (data.status !== 'verified') throw new Error('Status should be verified');
  if (!data.ageVerified) throw new Error('Age should be verified');
  if (!data.membershipOptIn) throw new Error('Membership should be opted in');
  if (!data.loyaltyEnrollment) throw new Error('Missing loyalty enrollment');

  console.log(`   Status: ${data.status}`);
  console.log(`   Loyalty ID: ${data.loyaltyEnrollment.loyaltyId}`);
});

// Test 4: Stats
test('GET /api/v1/post-purchase/stats - Get verification stats', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/post-purchase/stats`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.success) throw new Error('Response success = false');
  if (!data.stats) throw new Error('Missing stats');
  if (data.stats.verified !== 1) throw new Error('Should have 1 verified order');

  console.log(`   Total Orders: ${data.stats.totalOrders}`);
  console.log(`   Verified: ${data.stats.verified}`);
  console.log(`   Verification Rate: ${data.stats.verificationRate}%`);
});

// Test 5: Check expired (should find none)
test('POST /api/v1/post-purchase/check-expired - Check for expired orders', async () => {
  const response = await fetch(`${BASE_URL}/api/v1/post-purchase/check-expired`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.success) throw new Error('Response success = false');
  if (data.expiredCount !== 0) throw new Error('Should have 0 expired orders');

  console.log(`   Expired Count: ${data.expiredCount}`);
});

// Run all tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
