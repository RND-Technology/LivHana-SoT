#!/usr/bin/env node
/**
 * Gmail OAuth 2.0 Authentication - Multi-Account Support
 *
 * Features:
 * - Opens browser for user consent
 * - Saves tokens securely
 * - Supports multiple accounts (jesseniesen@gmail.com, high@reggieanddro.com)
 * - Token refresh handling
 * - 1Password reference support for credentials
 *
 * Usage:
 *   node gmail_auth.js --account=jesseniesen
 *   node gmail_auth.js --account=high
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import http from 'http';
import { URL } from 'url';
import open from 'open';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata'
];

// Account configurations
const ACCOUNTS = {
  jesseniesen: {
    email: 'jesseniesen@gmail.com',
    name: 'jesseniesen',
    credentialsPath: join(__dirname, 'gmail_credentials_jessen.json'),
    tokenPath: join(__dirname, 'gmail_token_jessen.json')
  },
  high: {
    email: 'high@reggieanddro.com',
    name: 'high_randd',
    credentialsPath: join(__dirname, 'gmail_credentials_high.json'),
    tokenPath: join(__dirname, 'gmail_token_high.json')
  }
};

/**
 * Load credentials from file or 1Password
 */
function loadCredentials(credentialsPath) {
  if (!existsSync(credentialsPath)) {
    console.error(`❌ Credentials file not found: ${credentialsPath}`);
    console.error('');
    console.error('📋 Setup instructions:');
    console.error('1. Go to https://console.cloud.google.com/apis/credentials');
    console.error('2. Create OAuth 2.0 Client ID (Desktop app)');
    console.error('3. Download credentials JSON');
    console.error(`4. Save as: ${credentialsPath}`);
    console.error('');
    console.error('💡 For 1Password integration, you can store credentials in 1Password');
    console.error('   and reference them using: op://vault/item/field');
    process.exit(1);
  }

  const credentialsRaw = readFileSync(credentialsPath, 'utf-8');

  // Check if it's a 1Password reference
  if (credentialsRaw.trim().startsWith('op://')) {
    console.log('🔐 Detected 1Password reference, fetching credentials...');
    try {
      // Use 1Password CLI to fetch credentials
      const { execSync } = require('child_process');
      const credentials = execSync(`op read '${credentialsRaw.trim()}'`, {
        encoding: 'utf-8'
      });
      return JSON.parse(credentials);
    } catch {
      console.error('❌ Failed to fetch credentials from 1Password:', error.message);
      console.error('💡 Make sure 1Password CLI is installed and you are signed in');
      console.error('   Install: https://1password.com/downloads/command-line/');
      process.exit(1);
    }
  }

  return JSON.parse(credentialsRaw);
}

/**
 * Authorize account
 */
async function authorize(account) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 Gmail OAuth Authentication');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`📧 Account: ${account.email}`);
  console.log(`📁 Name: ${account.name}`);
  console.log('');

  // Load credentials
  const credentials = loadCredentials(account.credentialsPath);
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  if (!client_id || !client_secret || !redirect_uris) {
    console.error('❌ Invalid credentials format');
    console.error('Expected format: { "installed": { "client_id", "client_secret", "redirect_uris" } }');
    process.exit(1);
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if token already exists
  if (existsSync(account.tokenPath)) {
    console.log('⚠️  Existing token found');
    console.log('');
    console.log('This will overwrite the existing token.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force consent screen to get refresh token
  });

  console.log('🌐 Opening browser for authorization...');
  console.log('');
  console.log('🔗 If browser doesn\'t open, visit this URL:');
  console.log(authUrl);
  console.log('');
  console.log('⏳ Waiting for authorization...');
  console.log('');

  // Open browser
  try {
    await open(authUrl);
  } catch {
    console.warn('⚠️  Could not open browser automatically');
  }

  // Create local server to receive OAuth callback
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:3000');
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          console.error(`❌ Authorization error: ${error}`);
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window and try again.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`Authorization failed: ${error}`));
          return;
        }

        if (code) {
          // Exchange code for tokens
          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);

          // Save tokens
          writeFileSync(account.tokenPath, JSON.stringify(tokens, null, 2), {
            mode: 0o600 // Restrict permissions
          });

          console.log('✅ Authorization successful!');
          console.log('');
          console.log(`🔑 Token saved to: ${account.tokenPath}`);
          console.log(`📧 Account: ${account.email}`);
          console.log('');
          console.log('Token details:');
          console.log(`  - Access token: ${tokens.access_token?.substring(0, 20)}...`);
          console.log(`  - Refresh token: ${tokens.refresh_token ? 'Present' : 'Missing (requires consent)'}`);
          console.log(`  - Expires: ${new Date(tokens.expiry_date).toLocaleString()}`);
          console.log('');
          console.log('✅ You can now run gmail_ingest.js for this account');
          console.log('');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>✅ Authorization Successful!</h1>
                <p><strong>Account:</strong> ${account.email}</p>
                <p>Token has been saved securely.</p>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          server.close();
          resolve(tokens);
        }
      } catch (authError) {
        console.error('❌ Error during authorization:', authError.message);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1>❌ Authorization Failed</h1>
              <p>${authError.message}</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        server.close();
        reject(authError);
      }
    });

    server.listen(3000, () => {
      console.log('📡 Local server listening on http://localhost:3000');
      console.log('');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      console.error('❌ Authorization timed out (5 minutes)');
      server.close();
      reject(new Error('Authorization timeout'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const accountArg = args.find(arg => arg.startsWith('--account='))?.split('=')[1];

  if (!accountArg) {
    console.error('❌ Missing required argument: --account=<name>');
    console.error('');
    console.error('Available accounts:');
    for (const [key, account] of Object.entries(ACCOUNTS)) {
      console.error(`  - ${key} (${account.email})`);
    }
    console.error('');
    console.error('Usage:');
    console.error('  node gmail_auth.js --account=jesseniesen');
    console.error('  node gmail_auth.js --account=high');
    process.exit(1);
  }

  const account = ACCOUNTS[accountArg];

  if (!account) {
    console.error(`❌ Unknown account: ${accountArg}`);
    console.error('');
    console.error('Available accounts:');
    for (const [key, account] of Object.entries(ACCOUNTS)) {
      console.error(`  - ${key} (${account.email})`);
    }
    process.exit(1);
  }

  try {
    await authorize(account);
    process.exit(0);
  } catch (finalError) {
    console.error('❌ Authorization failed:', finalError.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { authorize, ACCOUNTS };
// Last optimized: 2025-10-02
