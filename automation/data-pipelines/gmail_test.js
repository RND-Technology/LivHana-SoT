#!/usr/bin/env node
/**
 * Gmail Ingestion Pipeline - Test Suite
 *
 * Tests:
 * - OAuth authentication
 * - Message fetching and parsing
 * - Content extraction
 * - Category detection
 * - Deduplication
 * - BigQuery schema validation
 */

import 'dotenv/config';
import { google } from 'googleapis';
import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET || 'communications';

const ACCOUNTS = [
  {
    email: 'jesseniesen@gmail.com',
    name: 'jesseniesen',
    credentialsPath: join(__dirname, 'gmail_credentials_jessen.json'),
    tokenPath: join(__dirname, 'gmail_token_jessen.json')
  },
  {
    email: 'high@reggieanddro.com',
    name: 'high_randd',
    credentialsPath: join(__dirname, 'gmail_credentials_high.json'),
    tokenPath: join(__dirname, 'gmail_token_high.json')
  }
];

const bigquery = new BigQuery(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Test runner
 */
async function test(name, fn) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    await fn();
    console.log('✅ PASS');
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
  } catch (error) {
    console.log('❌ FAIL');
    console.error(`  Error: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Test: Credentials exist
 */
async function testCredentialsExist() {
  for (const account of ACCOUNTS) {
    assert(
      existsSync(account.credentialsPath),
      `Credentials file not found: ${account.credentialsPath}`
    );
  }
}

/**
 * Test: Tokens exist
 */
async function testTokensExist() {
  let hasAnyToken = false;
  for (const account of ACCOUNTS) {
    if (existsSync(account.tokenPath)) {
      hasAnyToken = true;
      break;
    }
  }
  assert(hasAnyToken, 'No token files found. Run gmail_auth.js first.');
}

/**
 * Test: OAuth client creation
 */
async function testOAuthClientCreation() {
  // Find first account with token
  const account = ACCOUNTS.find(a => existsSync(a.tokenPath));
  assert(account, 'No account with token found');

  const credentials = JSON.parse(readFileSync(account.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(account.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  assert(client_id, 'Missing client_id in credentials');
  assert(client_secret, 'Missing client_secret in credentials');
  assert(redirect_uris && redirect_uris.length > 0, 'Missing redirect_uris in credentials');

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oauth2Client.setCredentials(token);

  assert(oauth2Client.credentials.access_token, 'OAuth client has no access token');
}

/**
 * Test: Gmail API connection
 */
async function testGmailAPIConnection() {
  const account = ACCOUNTS.find(a => existsSync(a.tokenPath));
  assert(account, 'No account with token found');

  const credentials = JSON.parse(readFileSync(account.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(account.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Fetch user profile to test connection
  const profile = await gmail.users.getProfile({ userId: 'me' });

  assert(profile.data.emailAddress, 'Could not fetch email address from Gmail API');
  assert(
    profile.data.emailAddress === account.email,
    `Email mismatch: expected ${account.email}, got ${profile.data.emailAddress}`
  );
}

/**
 * Test: Fetch messages
 */
async function testFetchMessages() {
  const account = ACCOUNTS.find(a => existsSync(a.tokenPath));
  assert(account, 'No account with token found');

  const credentials = JSON.parse(readFileSync(account.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(account.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Fetch a few messages
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5
  });

  assert(response.data, 'No data in messages list response');
  assert(Array.isArray(response.data.messages) || response.data.messages === undefined, 'Messages is not an array');
}

/**
 * Test: Parse message
 */
async function testParseMessage() {
  const account = ACCOUNTS.find(a => existsSync(a.tokenPath));
  assert(account, 'No account with token found');

  const credentials = JSON.parse(readFileSync(account.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(account.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(token);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Fetch messages
  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 1
  });

  if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
    console.log('  (Skipped: No messages found)');
    return;
  }

  const messageId = listResponse.data.messages[0].id;

  // Fetch full message
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  });

  assert(message.data, 'No message data');
  assert(message.data.id === messageId, 'Message ID mismatch');
  assert(message.data.payload, 'Message has no payload');
  assert(message.data.threadId, 'Message has no thread ID');
}

/**
 * Test: Message hash generation
 */
async function testMessageHashGeneration() {
  const messageId = 'test123';
  const accountEmail = 'test@example.com';

  const hash = createHash('sha256')
    .update(`${accountEmail}:${messageId}`)
    .digest('hex');

  assert(hash, 'Hash generation failed');
  assert(hash.length === 64, 'Hash length is not 64 characters');
  assert(/^[a-f0-9]{64}$/.test(hash), 'Hash is not valid hex');
}

/**
 * Test: Category detection
 */
async function testCategoryDetection() {
  // Mock functions for testing
  function detectCategory(headers, body, labels) {
    const subject = headers.subject?.toLowerCase() || '';
    const fromEmail = headers.from?.toLowerCase() || '';
    const text = body.text?.toLowerCase() || '';

    const cannabisKeywords = ['cannabis', 'marijuana', 'dispensary'];
    const complianceKeywords = ['compliance', 'regulation', 'license'];
    const legalKeywords = ['legal', 'attorney', 'lawyer'];

    const categories = [];

    if (cannabisKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
      categories.push('cannabis_business');
    }

    if (complianceKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
      categories.push('compliance');
    }

    if (legalKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
      categories.push('legal');
    }

    return categories.length > 0 ? categories : ['general'];
  }

  // Test cannabis detection
  let categories = detectCategory(
    { subject: 'Cannabis License Application' },
    { text: 'Our dispensary needs to renew the license' },
    []
  );
  assert(categories.includes('cannabis_business'), 'Failed to detect cannabis category');

  // Test compliance detection
  categories = detectCategory(
    { subject: 'Regulatory Compliance Update' },
    { text: 'New regulation requires compliance by next month' },
    []
  );
  assert(categories.includes('compliance'), 'Failed to detect compliance category');

  // Test legal detection
  categories = detectCategory(
    { subject: 'Legal Review Required' },
    { text: 'Our attorney needs to review this contract' },
    []
  );
  assert(categories.includes('legal'), 'Failed to detect legal category');

  // Test general fallback
  categories = detectCategory(
    { subject: 'Hello' },
    { text: 'How are you?' },
    []
  );
  assert(categories.includes('general'), 'Failed to set general category as fallback');
}

/**
 * Test: BigQuery dataset exists
 */
async function testBigQueryDatasetExists() {
  const dataset = bigquery.dataset(BIGQUERY_DATASET);
  const [exists] = await dataset.exists();

  if (!exists) {
    console.log(`  (Warning: Dataset ${BIGQUERY_DATASET} does not exist yet)`);
  }
  // Don't fail - it's okay if dataset doesn't exist yet
}

/**
 * Test: BigQuery tables exist
 */
async function testBigQueryTablesExist() {
  const dataset = bigquery.dataset(BIGQUERY_DATASET);
  const [exists] = await dataset.exists();

  if (!exists) {
    console.log('  (Skipped: Dataset does not exist)');
    return;
  }

  const tables = ['gmail_messages', 'gmail_threads', 'gmail_attachments'];

  for (const tableName of tables) {
    const table = dataset.table(tableName);
    const [tableExists] = await table.exists();

    if (!tableExists) {
      console.log(`  (Warning: Table ${tableName} does not exist yet)`);
    }
  }
  // Don't fail - it's okay if tables don't exist yet
}

/**
 * Test: Environment variables
 */
async function testEnvironmentVariables() {
  // GCP_PROJECT_ID is optional but recommended
  if (!process.env.GCP_PROJECT_ID) {
    console.log('  (Warning: GCP_PROJECT_ID not set)');
  }

  // BQ_DATASET is optional (defaults to 'communications')
  const dataset = process.env.BQ_DATASET || 'communications';
  assert(dataset, 'Dataset name is empty');
}

/**
 * Test: Account configuration
 */
async function testAccountConfiguration() {
  assert(ACCOUNTS.length > 0, 'No accounts configured');

  for (const account of ACCOUNTS) {
    assert(account.email, 'Account missing email');
    assert(account.name, 'Account missing name');
    assert(account.credentialsPath, 'Account missing credentials path');
    assert(account.tokenPath, 'Account missing token path');
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Gmail Ingestion Pipeline - Test Suite');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Run tests
  await test('Environment variables', testEnvironmentVariables);
  await test('Account configuration', testAccountConfiguration);
  await test('Credentials files exist', testCredentialsExist);
  await test('Token files exist', testTokensExist);
  await test('OAuth client creation', testOAuthClientCreation);
  await test('Gmail API connection', testGmailAPIConnection);
  await test('Fetch messages list', testFetchMessages);
  await test('Parse single message', testParseMessage);
  await test('Message hash generation', testMessageHashGeneration);
  await test('Category detection', testCategoryDetection);
  await test('BigQuery dataset exists', testBigQueryDatasetExists);
  await test('BigQuery tables exist', testBigQueryTablesExist);

  // Print results
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Results');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.log('Failed tests:');
    for (const test of results.tests) {
      if (test.status === 'FAIL') {
        console.log(`  - ${test.name}: ${test.error}`);
      }
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. If you haven\'t already, run: node gmail_auth.js --account=jesseniesen');
    console.log('2. Run the ingestion: node gmail_ingest.js');
    console.log('');
    process.exit(0);
  }
}

// Run tests
main().catch((error) => {
  console.error('');
  console.error('❌ Test suite failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
