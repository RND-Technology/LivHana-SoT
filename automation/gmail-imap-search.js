#!/usr/bin/env node
/**
 * Gmail IMAP Search - Direct email access
 */

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { inspect } from 'util';
import { writeFileSync } from 'fs';

const GMAIL_EMAIL = 'jesseniesen@gmail.com';
const GMAIL_PASSWORD = 'HighNoon2025';

const imap = new Imap({
  user: GMAIL_EMAIL,
  password: GMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

const emails = [];

imap.once('ready', function() {
  console.log('✅ Connected to Gmail IMAP\n');
  console.log('🔍 Searching for Lindsay Goldsmith + Square emails...\n');

  openInbox(function(err, box) {
    if (err) throw err;

    // Search for emails
    imap.search([
      'OR',
      ['FROM', 'Lindsay Goldsmith'],
      ['FROM', 'squareup.com'],
      ['SUBJECT', 'Square'],
      ['SUBJECT', 'deactivat']
    ], function(err, results) {
      if (err) throw err;

      if (results.length === 0) {
        console.log('No emails found');
        imap.end();
        return;
      }

      console.log(`Found ${results.length} emails\n`);

      const fetch = imap.fetch(results, { bodies: '' });

      fetch.on('message', function(msg, seqno) {
        msg.on('body', function(stream, info) {
          simpleParser(stream, async (err, parsed) => {
            if (err) throw err;

            const email = {
              index: seqno,
              from: parsed.from?.text || 'Unknown',
              to: parsed.to?.text || 'Unknown',
              subject: parsed.subject || 'No Subject',
              date: parsed.date,
              text: parsed.text || '',
              html: parsed.html || ''
            };

            emails.push(email);

            console.log(`\n📧 EMAIL ${seqno}`);
            console.log(`From: ${email.from}`);
            console.log(`Subject: ${email.subject}`);
            console.log(`Date: ${email.date}`);
            console.log(`\nBody preview:\n${email.text.substring(0, 500)}...\n`);
            console.log('='.repeat(80));
          });
        });
      });

      fetch.once('error', function(err) {
        console.error('Fetch error:', err);
      });

      fetch.once('end', function() {
        console.log('\n✅ Done fetching');

        // Wait for parsing
        setTimeout(() => {
          // Save results
          const report = `# SQUARE DEACTIVATION - LINDSAY GOLDSMITH EMAILS

Found: ${emails.length} emails

${'='.repeat(80)}

${emails.map(e => `
## EMAIL ${e.index}

**From**: ${e.from}
**To**: ${e.to}
**Subject**: ${e.subject}
**Date**: ${e.date}

### Body:
${e.text}

${'='.repeat(80)}
`).join('\n')}
`;

          writeFileSync('automation/SQUARE_EMAILS_IMAP.md', report);
          console.log('\n📁 Saved to: automation/SQUARE_EMAILS_IMAP.md');

          // Analyze
          console.log('\n\n📊 FACTS EXTRACTED:\n');

          const allText = emails.map(e => e.text).join(' ').toLowerCase();

          console.log('1️⃣  DEACTIVATION REASON:');
          if (allText.includes('deactivat')) {
            console.log('   ✅ Deactivation mentioned in emails');
          } else {
            console.log('   ⚠️  No deactivation mentioned');
          }

          console.log('\n2️⃣  CBD/HEMP:');
          if (allText.includes('cbd') || allText.includes('hemp')) {
            console.log('   ✅ CBD/Hemp products mentioned');
          } else {
            console.log('   ⚠️  No CBD/Hemp mentions');
          }

          console.log('\n3️⃣  VISA RESTRICTIONS:');
          if (allText.includes('visa')) {
            console.log('   ✅ VISA mentioned');
          } else {
            console.log('   ⚠️  No VISA restrictions mentioned');
          }

          console.log('\n4️⃣  REACTIVATION PATH:');
          if (allText.includes('reactivat') || allText.includes('appeal')) {
            console.log('   ✅ Reactivation instructions found');
          } else {
            console.log('   ⚠️  No reactivation path mentioned');
          }

          console.log('\n\n✅ INVESTIGATION COMPLETE\n');
          console.log('📞 Next: Call Lindsay Goldsmith 636-565-0896\n');

          imap.end();
        }, 3000);
      });
    });
  });
});

imap.once('error', function(err) {
  console.error('❌ IMAP Error:', err.message);
  process.exit(1);
});

imap.once('end', function() {
  console.log('Connection ended');
  process.exit(0);
});

console.log('🔐 Connecting to Gmail IMAP...\n');
imap.connect();
