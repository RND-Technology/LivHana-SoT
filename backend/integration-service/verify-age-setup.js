#!/usr/bin/env node

/**
 * Age Verification System - Setup & Verification Script
 *
 * This script helps verify the age verification system is properly set up.
 * Run before deployment to ensure everything is configured correctly.
 *
 * Usage: node verify-age-setup.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Age Verification System - Setup Check');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Verify core module exists
console.log('✓ Checking core module...');
try {
  const ageVerification = require('./src/age_verification');
  console.log('  ✓ Core module loaded');

  // Test basic functionality
  const dobResult = ageVerification.validateDateOfBirth('1990-01-01');
  if (!dobResult.valid) {
    console.log('  ✗ DOB validation not working correctly');
    hasErrors = true;
  } else {
    console.log('  ✓ DOB validation working');
  }

  const nameResult = ageVerification.validateFullName('John Doe');
  if (!nameResult.valid) {
    console.log('  ✗ Name validation not working correctly');
    hasErrors = true;
  } else {
    console.log('  ✓ Name validation working');
  }

  const stateResult = ageVerification.validateState('TX');
  if (!stateResult.valid) {
    console.log('  ✗ State validation not working correctly');
    hasErrors = true;
  } else {
    console.log('  ✓ State validation working');
  }

} catch (error) {
  console.log('  ✗ Failed to load core module:', error.message);
  hasErrors = true;
}

// Check 2: Verify storage module exists
console.log('\n✓ Checking storage module...');
try {
  const AgeVerificationStore = require('./src/age_verification_store');
  console.log('  ✓ Storage module loaded');

  // Test instantiation
  new AgeVerificationStore({ mockMode: true });
  console.log('  ✓ Storage instance created (mock mode)');

} catch (error) {
  console.log('  ✗ Failed to load storage module:', error.message);
  hasErrors = true;
}

// Check 3: Verify routes module exists
console.log('\n✓ Checking routes module...');
try {
  require('./src/age_verification_routes');
  console.log('  ✓ Routes module loaded');
} catch (error) {
  console.log('  ✗ Failed to load routes module:', error.message);
  hasErrors = true;
}

// Check 4: Verify tests exist
console.log('\n✓ Checking test suite...');
const testPath = path.join(__dirname, 'tests', 'age_verification.test.js');
if (fs.existsSync(testPath)) {
  console.log('  ✓ Test suite exists');
  console.log('  → Run: npm test -- tests/age_verification.test.js');
} else {
  console.log('  ✗ Test suite not found');
  hasErrors = true;
}

// Check 5: Check environment variables
console.log('\n✓ Checking environment configuration...');

if (!process.env.AGE_VERIFICATION_ENCRYPTION_KEY) {
  console.log('  ⚠ AGE_VERIFICATION_ENCRYPTION_KEY not set');
  console.log('  → Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\').substring(0, 32))"');
  hasWarnings = true;
} else if (process.env.AGE_VERIFICATION_ENCRYPTION_KEY.length !== 32) {
  console.log('  ✗ AGE_VERIFICATION_ENCRYPTION_KEY must be exactly 32 bytes');
  hasErrors = true;
} else {
  console.log('  ✓ Encryption key configured');
}

if (!process.env.GCP_PROJECT_ID) {
  console.log('  ⚠ GCP_PROJECT_ID not set (will run in mock mode)');
  hasWarnings = true;
} else {
  console.log('  ✓ GCP project configured:', process.env.GCP_PROJECT_ID);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('  ⚠ GOOGLE_APPLICATION_CREDENTIALS not set (will run in mock mode)');
  hasWarnings = true;
} else {
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fs.existsSync(credsPath)) {
    console.log('  ✓ BigQuery credentials file found');
  } else {
    console.log('  ✗ BigQuery credentials file not found:', credsPath);
    hasErrors = true;
  }
}

if (!process.env.JWT_SECRET) {
  console.log('  ⚠ JWT_SECRET not set');
  hasWarnings = true;
} else {
  console.log('  ✓ JWT authentication configured');
}

// Check 6: Test encryption
console.log('\n✓ Testing encryption...');
try {
  const { encryptData, decryptData } = require('./src/age_verification');
  const testKey = crypto.randomBytes(32).toString('hex').substring(0, 32);
  const testData = 'Test sensitive data';

  const encrypted = encryptData(testData, testKey);
  const decrypted = decryptData(encrypted, testKey);

  if (decrypted === testData) {
    console.log('  ✓ Encryption/decryption working correctly');
  } else {
    console.log('  ✗ Encryption/decryption failed verification');
    hasErrors = true;
  }
} catch (error) {
  console.log('  ✗ Encryption test failed:', error.message);
  hasErrors = true;
}

// Check 7: Documentation
console.log('\n✓ Checking documentation...');
const docs = [
  'AGE_VERIFICATION_API.md',
  'AGE_VERIFICATION_DEPLOYMENT.md',
  'AGE_VERIFICATION_README.md',
  'AGE_VERIFICATION_SUMMARY.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`  ✓ ${doc} exists`);
  } else {
    console.log(`  ✗ ${doc} not found`);
    hasWarnings = true;
  }
});

// Summary
console.log('\n========================================');
console.log('Setup Verification Complete');
console.log('========================================\n');

if (hasErrors) {
  console.log('❌ ERRORS FOUND - Fix errors before deployment');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS FOUND - Review warnings before deployment');
  console.log('   System will run in mock mode without full configuration');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Run tests: npm test -- tests/age_verification.test.js');
  console.log('2. Review deployment guide: AGE_VERIFICATION_DEPLOYMENT.md');
  console.log('3. Start service: npm start');
  console.log('4. Test health: curl http://localhost:3005/health/age-verification');
  process.exit(0);
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
