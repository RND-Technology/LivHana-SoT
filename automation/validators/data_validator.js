#!/usr/bin/env node
/**
 * Automated Data Validator - BigQuery Sync Checker
 * Cross-checks documentation against live BigQuery data
 * Alerts on data drift
 *
 * Usage: node data_validator.js [--update-docs]
 */

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync, writeFileSync } from 'fs';
import 'dotenv/config';

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID
});

const DATASET = process.env.BQ_DATASET || 'commerce';

class DataValidator {
  constructor(options = {}) {
    this.updateDocs = options.updateDocs || false;
    this.errors = [];
    this.drifts = [];
  }

  async validate() {
    console.log('📊 DATA VALIDATION INITIATED - Syncing with BigQuery\n');

    try {
      // Query BigQuery for actual data
      const actualData = await this.queryBigQuery();

      // Read documented data from CURRENT_STATUS.md
      const documentedData = this.readDocumentedData();

      // Compare actual vs documented
      this.compareData(actualData, documentedData);

      // Update docs if flag is set
      if (this.updateDocs && this.drifts.length > 0) {
        this.updateDocumentation(actualData);
      }

      return this.report();
    } catch (error) {
      console.error('❌ Data validation failed:', error.message);
      process.exit(1);
    }
  }

  async queryBigQuery() {
    console.log('Querying BigQuery for actual data...');

    // Query customer count
    const [customerRows] = await bigquery.query({
      query: `SELECT COUNT(*) as count FROM \`${process.env.GCP_PROJECT_ID}.${DATASET}.square_customers\``,
      location: 'US'
    });
    const customerCount = parseInt(customerRows[0].count);

    // Query transaction count
    const [transactionRows] = await bigquery.query({
      query: `SELECT COUNT(*) as count FROM \`${process.env.GCP_PROJECT_ID}.${DATASET}.square_transactions\``,
      location: 'US'
    });
    const transactionCount = parseInt(transactionRows[0].count);

    // Query bank account count
    const [bankRows] = await bigquery.query({
      query: `SELECT COUNT(*) as count FROM \`${process.env.GCP_PROJECT_ID}.${DATASET}.square_bank_accounts\``,
      location: 'US'
    });
    const bankAccountCount = parseInt(bankRows[0].count);

    console.log('✅ BigQuery data retrieved\n');

    return {
      customers: customerCount,
      transactions: transactionCount,
      bankAccounts: bankAccountCount,
      timestamp: new Date().toISOString()
    };
  }

  readDocumentedData() {
    const statusDoc = readFileSync('docs/CURRENT_STATUS.md', 'utf-8');

    // Extract numbers from the documented data
    const customerMatch = statusDoc.match(/(\d{1,3}(?:,\d{3})*)\s+customers/);
    const transactionMatch = statusDoc.match(/(\d{1,3}(?:,\d{3})*)\s+transactions/);
    const bankMatch = statusDoc.match(/(\d+)\s+bank accounts/);

    return {
      customers: customerMatch ? parseInt(customerMatch[1].replace(/,/g, '')) : null,
      transactions: transactionMatch ? parseInt(transactionMatch[1].replace(/,/g, '')) : null,
      bankAccounts: bankMatch ? parseInt(bankMatch[1]) : null
    };
  }

  compareData(actual, documented) {
    // Check customer count
    if (actual.customers !== documented.customers) {
      this.drifts.push({
        metric: 'customers',
        actual: actual.customers,
        documented: documented.customers,
        drift: actual.customers - documented.customers
      });
    }

    // Check transaction count
    if (actual.transactions !== documented.transactions) {
      this.drifts.push({
        metric: 'transactions',
        actual: actual.transactions,
        documented: documented.transactions,
        drift: actual.transactions - documented.transactions
      });
    }

    // Check bank account count
    if (actual.bankAccounts !== documented.bankAccounts) {
      this.drifts.push({
        metric: 'bank_accounts',
        actual: actual.bankAccounts,
        documented: documented.bankAccounts,
        drift: actual.bankAccounts - documented.bankAccounts
      });
    }
  }

  updateDocumentation(actualData) {
    console.log('📝 Updating documentation with actual data...\n');

    let statusDoc = readFileSync('docs/CURRENT_STATUS.md', 'utf-8');

    // Update customer count
    statusDoc = statusDoc.replace(
      /(\d{1,3}(?:,\d{3})*)\s+customers/,
      `${actualData.customers.toLocaleString()} customers`
    );

    // Update transaction count
    statusDoc = statusDoc.replace(
      /(\d{1,3}(?:,\d{3})*)\s+transactions/,
      `${actualData.transactions.toLocaleString()} transactions`
    );

    // Update bank account count
    statusDoc = statusDoc.replace(
      /(\d+)\s+bank accounts/,
      `${actualData.bankAccounts} bank accounts`
    );

    writeFileSync('docs/CURRENT_STATUS.md', statusDoc);
    console.log('✅ Documentation updated\n');
  }

  report() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATA VALIDATION RESULTS');
    console.log('='.repeat(80) + '\n');

    if (this.drifts.length === 0) {
      console.log('✅ VALIDATION COMPLETE: All documented data matches BigQuery\n');
      return { success: true, drifts: 0 };
    }

    console.log(`⚠️  DATA DRIFT DETECTED: ${this.drifts.length} metrics out of sync\n`);

    for (const drift of this.drifts) {
      console.log(`  Metric: ${drift.metric}`);
      console.log(`  Documented: ${drift.documented?.toLocaleString() || 'N/A'}`);
      console.log(`  Actual (BigQuery): ${drift.actual.toLocaleString()}`);
      console.log(`  Drift: ${drift.drift > 0 ? '+' : ''}${drift.drift.toLocaleString()}`);
      console.log('');
    }

    if (!this.updateDocs) {
      console.log('💡 TIP: Run with --update-docs flag to auto-update documentation\n');
    }

    return {
      success: false,
      drifts: this.drifts.length,
      details: this.drifts
    };
  }
}

// CLI execution
const args = process.argv.slice(2);
const options = {
  updateDocs: args.includes('--update-docs')
};

const validator = new DataValidator(options);
validator.validate().catch((error) => {
  console.error('❌ Data validator error:', error);
  process.exit(1);
});

export { DataValidator };
// Last optimized: 2025-10-02
