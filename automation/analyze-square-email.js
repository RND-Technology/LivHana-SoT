#!/usr/bin/env node
/**
 * Analyze Square/Lindsay Goldsmith email content
 *
 * USAGE:
 *   node automation/analyze-square-email.js < email.txt
 *   OR paste email content and press Ctrl+D
 */

import { stdin } from 'process';

async function analyzeEmail() {
  console.log('📧 Email Analyzer - Square Account Deactivation\n');
  console.log('Paste email content (press Ctrl+D when done):\n');

  // Read stdin
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }

  const emailText = Buffer.concat(chunks).toString('utf-8');

  if (!emailText.trim()) {
    console.error('❌ No email content provided');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');

  const lowerText = emailText.toLowerCase();

  // Extract key information
  console.log('📋 FACT EXTRACTION:\n');

  // 1. Deactivation reason
  console.log('1️⃣  DEACTIVATION REASON:');
  const deactivationKeywords = [
    'deactivat',
    'suspend',
    'restrict',
    'violat',
    'prohibited',
    'unacceptable',
    'not allowed',
    'restricted activity'
  ];

  let foundDeactivation = false;
  for (const keyword of deactivationKeywords) {
    if (lowerText.includes(keyword)) {
      // Extract context around keyword
      const index = lowerText.indexOf(keyword);
      const start = Math.max(0, index - 150);
      const end = Math.min(emailText.length, index + 200);
      const context = emailText.substring(start, end).trim();
      console.log(`   Found "${keyword}": ${context}`);
      foundDeactivation = true;
    }
  }

  if (!foundDeactivation) {
    console.log('   ⚠️  No explicit deactivation reason found');
  }

  // 2. Hemp/CBD mentions
  console.log('\n2️⃣  HEMP/CBD MENTIONS:');
  const cbdKeywords = ['cbd', 'hemp', 'cannabis', 'thc', 'cannabinoid', 'marijuana'];
  let foundCBD = false;

  for (const keyword of cbdKeywords) {
    if (lowerText.includes(keyword)) {
      const index = lowerText.indexOf(keyword);
      const start = Math.max(0, index - 100);
      const end = Math.min(emailText.length, index + 150);
      const context = emailText.substring(start, end).trim();
      console.log(`   Found "${keyword}": ${context}`);
      foundCBD = true;
    }
  }

  if (!foundCBD) {
    console.log('   No hemp/CBD mentions');
  }

  // 3. VISA/payment processor mentions
  console.log('\n3️⃣  PAYMENT PROCESSOR RESTRICTIONS:');
  const visaKeywords = ['visa', 'mastercard', 'card network', 'payment network', 'processor'];
  let foundVISA = false;

  for (const keyword of visaKeywords) {
    if (lowerText.includes(keyword)) {
      const index = lowerText.indexOf(keyword);
      const start = Math.max(0, index - 100);
      const end = Math.min(emailText.length, index + 150);
      const context = emailText.substring(start, end).trim();
      console.log(`   Found "${keyword}": ${context}`);
      foundVISA = true;
    }
  }

  if (!foundVISA) {
    console.log('   No payment network restrictions mentioned');
  }

  // 4. Remedy/reactivation instructions
  console.log('\n4️⃣  REMEDY INSTRUCTIONS:');
  const remedyKeywords = ['reactivat', 'appeal', 'restore', 'remedy', 'resolve', 'fix', 'correct'];
  let foundRemedy = false;

  for (const keyword of remedyKeywords) {
    if (lowerText.includes(keyword)) {
      const index = lowerText.indexOf(keyword);
      const start = Math.max(0, index - 100);
      const end = Math.min(emailText.length, index + 200);
      const context = emailText.substring(start, end).trim();
      console.log(`   Found "${keyword}": ${context}`);
      foundRemedy = true;
    }
  }

  if (!foundRemedy) {
    console.log('   ⚠️  No reactivation instructions found');
  }

  // 5. Contact information
  console.log('\n5️⃣  CONTACT INFO:');
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

  const emails = emailText.match(emailPattern) || [];
  const phones = emailText.match(phonePattern) || [];

  if (emails.length > 0) {
    console.log('   Emails:', [...new Set(emails)].join(', '));
  }

  if (phones.length > 0) {
    console.log('   Phones:', [...new Set(phones)].join(', '));
  }

  if (emails.length === 0 && phones.length === 0) {
    console.log('   No contact info found');
  }

  // 6. Dates/deadlines
  console.log('\n6️⃣  IMPORTANT DATES:');
  const dateKeywords = ['deadline', 'by', 'before', 'within', 'days', 'appeal by'];
  let foundDates = false;

  for (const keyword of dateKeywords) {
    if (lowerText.includes(keyword)) {
      const index = lowerText.indexOf(keyword);
      const start = Math.max(0, index - 50);
      const end = Math.min(emailText.length, index + 100);
      const context = emailText.substring(start, end).trim();
      console.log(`   ${context}`);
      foundDates = true;
    }
  }

  if (!foundDates) {
    console.log('   No deadlines mentioned');
  }

  // Summary
  console.log('\n\n📊 SUMMARY:\n');
  console.log(`✓ Deactivation context: ${foundDeactivation ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`✓ Hemp/CBD mentions: ${foundCBD ? 'YES' : 'NO'}`);
  console.log(`✓ Payment restrictions: ${foundVISA ? 'YES' : 'NO'}`);
  console.log(`✓ Remedy instructions: ${foundRemedy ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`✓ Contact info: ${emails.length} emails, ${phones.length} phones`);

  // Recommendations
  console.log('\n\n🎯 RECOMMENDED ACTIONS:\n');

  if (foundDeactivation && foundCBD) {
    console.log('1. Account deactivated due to hemp/CBD products');
    console.log('2. Review Square Acceptable Use Policy on hemp');
    console.log('3. Contact Lindsay Goldsmith: 636-565-0896');
  }

  if (foundVISA) {
    console.log('4. VISA/card network restrictions apply');
    console.log('5. Research alternative payment processors');
  }

  if (foundRemedy) {
    console.log('6. Follow remedy instructions in email');
  } else {
    console.log('6. Request specific reactivation steps from Square');
  }

  console.log('7. See SQUARE_DEACTIVATION_INVESTIGATION.md for full checklist');

  console.log('\n✅ ANALYSIS COMPLETE\n');
}

analyzeEmail().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
});
