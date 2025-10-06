#!/usr/bin/env node
/**
 * Gmail Search: Lindsay Goldsmith - Square Account Deactivation
 *
 * MISSION: Find all emails from Lindsay Goldsmith about Square account deactivation
 * Extract facts:
 * - Why was account deactivated?
 * - How to remedy and reactivate?
 * - Status of Square CBD program?
 * - Can Hempress 3 CBD seeds be sold on Square?
 * - Did VISA shut down Square's hemp sales online?
 */

import { readFileSync, existsSync } from 'fs';
import { google } from 'googleapis';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACCOUNT = {
  email: 'jesseniesen@gmail.com',
  credentialsPath: join(__dirname, 'data-pipelines/gmail_credentials_jessen.json'),
  tokenPath: join(__dirname, 'data-pipelines/gmail_token_jessen.json')
};

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
  if (!existsSync(ACCOUNT.credentialsPath)) {
    throw new Error(`Missing credentials: ${ACCOUNT.credentialsPath}`);
  }

  if (!existsSync(ACCOUNT.tokenPath)) {
    throw new Error(`Missing token: ${ACCOUNT.tokenPath}. Run gmail_auth.js first.`);
  }

  const credentials = JSON.parse(readFileSync(ACCOUNT.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(ACCOUNT.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oauth2Client.setCredentials(token);

  return oauth2Client;
}

/**
 * Decode base64url
 */
function decodeBase64Url(data) {
  if (!data) return '';
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Extract email body
 */
function extractBody(payload) {
  let textBody = '';
  let htmlBody = '';

  function extractFromParts(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        textBody += decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody += decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        extractFromParts(part.parts);
      }
    }
  }

  if (payload.body?.data) {
    if (payload.mimeType === 'text/plain') {
      textBody = decodeBase64Url(payload.body.data);
    } else if (payload.mimeType === 'text/html') {
      htmlBody = decodeBase64Url(payload.body.data);
    }
  }

  if (payload.parts) {
    extractFromParts(payload.parts);
  }

  return { text: textBody, html: htmlBody };
}

/**
 * Get message headers
 */
function getHeaders(payload) {
  const headers = {};
  if (payload.headers) {
    for (const header of payload.headers) {
      headers[header.name.toLowerCase()] = header.value;
    }
  }
  return headers;
}

/**
 * Search Gmail and extract facts
 */
async function searchLindsaySquare() {
  console.log('🔍 Searching Gmail for Lindsay Goldsmith + Square deactivation\n');

  const oauth2Client = createOAuth2Client();
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Search query
  const query = 'from:Lindsay Goldsmith OR subject:Square OR (Square AND deactivation) OR (Square AND CBD)';

  console.log(`Query: ${query}\n`);

  // Search messages
  const searchResponse = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50
  });

  const messages = searchResponse.data.messages || [];
  console.log(`Found ${messages.length} messages\n`);
  console.log('=' .repeat(80));
  console.log('\n');

  const allEmails = [];

  // Fetch full message details
  for (const msg of messages) {
    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full'
    });

    const payload = fullMessage.data.payload;
    const headers = getHeaders(payload);
    const body = extractBody(payload);
    const date = new Date(parseInt(fullMessage.data.internalDate));

    const email = {
      id: msg.id,
      date: date.toISOString(),
      from: headers.from || 'Unknown',
      to: headers.to || 'Unknown',
      subject: headers.subject || '(No Subject)',
      snippet: fullMessage.data.snippet,
      body: body.text
    };

    allEmails.push(email);

    // Print email
    console.log(`📧 EMAIL ${allEmails.length}/${messages.length}`);
    console.log(`Date: ${date.toLocaleString()}`);
    console.log(`From: ${email.from}`);
    console.log(`To: ${email.to}`);
    console.log(`Subject: ${email.subject}`);
    console.log(`\nSnippet: ${email.snippet}`);

    if (body.text) {
      console.log(`\n--- FULL BODY ---`);
      console.log(body.text.substring(0, 2000)); // First 2000 chars
      if (body.text.length > 2000) {
        console.log(`\n... (${body.text.length - 2000} more characters)`);
      }
    }

    console.log('\n' + '=' .repeat(80) + '\n');
  }

  // Analyze and extract facts
  console.log('\n\n📊 ANALYSIS - SQUARE ACCOUNT DEACTIVATION\n');
  console.log('=' .repeat(80));

  // Find emails specifically from Lindsay Goldsmith
  const lindsayEmails = allEmails.filter(e =>
    e.from.toLowerCase().includes('lindsay') &&
    e.from.toLowerCase().includes('goldsmith')
  );

  console.log(`\n✅ Emails from Lindsay Goldsmith: ${lindsayEmails.length}`);

  if (lindsayEmails.length > 0) {
    console.log('\nLindsay Goldsmith correspondence:');
    lindsayEmails.forEach((email, i) => {
      console.log(`\n${i + 1}. ${email.date}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Snippet: ${email.snippet}`);
    });
  }

  // Find deactivation emails
  const deactivationEmails = allEmails.filter(e =>
    e.subject.toLowerCase().includes('deactivat') ||
    e.body.toLowerCase().includes('deactivat') ||
    e.subject.toLowerCase().includes('suspend') ||
    e.body.toLowerCase().includes('suspend')
  );

  console.log(`\n✅ Deactivation/Suspension emails: ${deactivationEmails.length}`);

  // Find CBD/Hemp emails
  const cbdEmails = allEmails.filter(e =>
    e.subject.toLowerCase().includes('cbd') ||
    e.body.toLowerCase().includes('cbd') ||
    e.subject.toLowerCase().includes('hemp') ||
    e.body.toLowerCase().includes('hemp')
  );

  console.log(`✅ CBD/Hemp related emails: ${cbdEmails.length}`);

  // Find VISA emails
  const visaEmails = allEmails.filter(e =>
    e.subject.toLowerCase().includes('visa') ||
    e.body.toLowerCase().includes('visa')
  );

  console.log(`✅ VISA related emails: ${visaEmails.length}`);

  // Extract key facts from email bodies
  console.log('\n\n📋 KEY FACTS EXTRACTION\n');
  console.log('=' .repeat(80));

  const allBodies = allEmails.map(e => e.body).join('\n\n').toLowerCase();

  console.log('\n1️⃣  WHY WAS ACCOUNT DEACTIVATED?');
  if (allBodies.includes('deactivat')) {
    const deactivationContext = allBodies.split('deactivat')[0].slice(-200) +
                                'deactivat' +
                                allBodies.split('deactivat')[1].slice(0, 200);
    console.log('   Found context:', deactivationContext.substring(0, 400));
  } else {
    console.log('   ⚠️  No explicit deactivation reason found in emails');
  }

  console.log('\n2️⃣  HOW TO REMEDY AND REACTIVATE?');
  if (allBodies.includes('reactivat') || allBodies.includes('restore')) {
    console.log('   ✅ Remedy instructions found in emails');
  } else {
    console.log('   ⚠️  No reactivation instructions found');
  }

  console.log('\n3️⃣  SQUARE CBD PROGRAM STATUS?');
  if (allBodies.includes('cbd program') || allBodies.includes('cbd')) {
    console.log('   ✅ CBD program mentioned in emails');
  } else {
    console.log('   ⚠️  No CBD program status found');
  }

  console.log('\n4️⃣  CAN HEMPRESS 3 CBD SEEDS BE SOLD?');
  if (allBodies.includes('seed') || allBodies.includes('hempress')) {
    console.log('   ✅ Seeds/Hempress mentioned');
  } else {
    console.log('   ⚠️  No specific information about seeds');
  }

  console.log('\n5️⃣  DID VISA SHUT DOWN HEMP SALES?');
  if (allBodies.includes('visa') && allBodies.includes('hemp')) {
    console.log('   ✅ VISA + Hemp mentioned together');
  } else {
    console.log('   ⚠️  No direct connection between VISA and hemp shutdown');
  }

  console.log('\n\n📞 CONTACT INFO\n');
  console.log('=' .repeat(80));
  console.log('\nLindsay Goldsmith');
  console.log('Retail Account Manager');
  console.log('Phone: 636-565-0896');

  console.log('\n\n✅ SEARCH COMPLETE\n');
  console.log(`Total emails analyzed: ${allEmails.length}`);
  console.log(`From Lindsay Goldsmith: ${lindsayEmails.length}`);
  console.log(`About deactivation: ${deactivationEmails.length}`);
  console.log(`About CBD/Hemp: ${cbdEmails.length}`);
  console.log(`About VISA: ${visaEmails.length}`);

  return {
    totalEmails: allEmails.length,
    lindsayEmails,
    deactivationEmails,
    cbdEmails,
    visaEmails,
    allEmails
  };
}

// Execute
searchLindsaySquare().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
});
