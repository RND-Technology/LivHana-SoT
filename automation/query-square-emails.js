#!/usr/bin/env node
/**
 * Query BigQuery for Lindsay Goldsmith / Square deactivation emails
 */

import { BigQuery } from '@google-cloud/bigquery';

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'reggieanddrodispensary';
const BIGQUERY_DATASET = 'communications';

const bigquery = new BigQuery({ projectId: GCP_PROJECT_ID });

async function querySquareEmails() {
  console.log('🔍 Querying BigQuery for Lindsay Goldsmith + Square emails\n');

  const query = `
    SELECT
      message_id,
      subject,
      from_email,
      from_name,
      date,
      timestamp,
      snippet,
      body_text,
      categories,
      labels
    FROM \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.gmail_messages\`
    WHERE (
      LOWER(from_email) LIKE '%lindsay%goldsmith%'
      OR LOWER(from_name) LIKE '%lindsay%goldsmith%'
      OR LOWER(subject) LIKE '%square%'
      OR LOWER(body_text) LIKE '%square%deactivat%'
      OR LOWER(body_text) LIKE '%square%cbd%'
      OR LOWER(body_text) LIKE '%visa%hemp%'
    )
    AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)
    ORDER BY timestamp DESC
    LIMIT 50
  `;

  try {
    console.log('Executing query...\n');
    const [rows] = await bigquery.query(query);

    console.log(`✅ Found ${rows.length} emails\n`);
    console.log('=' .repeat(80));

    rows.forEach((row, i) => {
      console.log(`\n📧 EMAIL ${i + 1}/${rows.length}`);
      console.log(`Date: ${new Date(row.timestamp.value).toLocaleString()}`);
      console.log(`From: ${row.from_name || row.from_email}`);
      console.log(`Subject: ${row.subject}`);
      console.log(`\nSnippet: ${row.snippet}`);

      if (row.body_text) {
        const preview = row.body_text.substring(0, 1000);
        console.log(`\n--- BODY ---`);
        console.log(preview);
        if (row.body_text.length > 1000) {
          console.log(`\n... (${row.body_text.length - 1000} more characters)`);
        }
      }

      console.log('\n' + '-'.repeat(80));
    });

    // Analysis
    console.log('\n\n📊 ANALYSIS\n');
    console.log('=' .repeat(80));

    const lindsayEmails = rows.filter(r =>
      r.from_email?.toLowerCase().includes('lindsay') ||
      r.from_name?.toLowerCase().includes('lindsay')
    );

    const deactivationEmails = rows.filter(r =>
      r.subject?.toLowerCase().includes('deactivat') ||
      r.body_text?.toLowerCase().includes('deactivat')
    );

    const cbdEmails = rows.filter(r =>
      r.subject?.toLowerCase().includes('cbd') ||
      r.body_text?.toLowerCase().includes('cbd') ||
      r.body_text?.toLowerCase().includes('hemp')
    );

    console.log(`From Lindsay Goldsmith: ${lindsayEmails.length}`);
    console.log(`About deactivation: ${deactivationEmails.length}`);
    console.log(`About CBD/Hemp: ${cbdEmails.length}`);

    return rows;

  } catch (error) {
    if (error.message.includes('Not found: Table')) {
      console.error('\n❌ Gmail data not in BigQuery yet');
      console.error('\nRun this first:');
      console.error('  node automation/data-pipelines/gmail_ingest.js\n');
    } else {
      console.error('\n❌ Query failed:', error.message);
    }
    throw error;
  }
}

querySquareEmails().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
