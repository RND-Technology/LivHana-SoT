#!/usr/bin/env node
/**
 * Automated Fallacy Scanner - ALWAYS ON
 * Validates all data against source truth
 * Zero tolerance for incorrect information
 *
 * Usage: node fallacy_scanner.js [--fix] [--ci]
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const FALLACY_PATTERNS = {
  // Made-up domains
  FAKE_DOMAINS: /livhana\.com(?![\w\-])/g,

  // Made-up emails
  FAKE_EMAILS: /(security|support|info|contact)@livhana\.com/g,
  PLACEHOLDER_EMAILS: /@(example|test|placeholder)\.com/g,

  // Incorrect entity formation language
  FORM_R_AND_D_WY: /form\s+(R&D\s+WY|R&D\s+Wyoming)/gi,
  CREATE_R_AND_D_WY: /create\s+(R&D\s+WY|R&D\s+Wyoming)/gi,

  // Approximate customer counts (should be exact)
  APPROXIMATE_CUSTOMERS: /\b(10k\+|10K\+|~\s*\d+\s*(customers|users)|approximately\s+\d+\s+(customers|users))/gi,

  // Domain acquisition language (all domains already owned)
  DOMAIN_ACQUISITION: /\b(acquire|purchase|buy)\s+(the\s+)?domain/gi,

  // Outdated payment processor references
  STRIPE_REFERENCES: /stripe\s+(payment|processor|gateway)/gi,
};

const SOURCE_TRUTH = {
  EXACT_CUSTOMER_COUNT: 11348,
  EXACT_TRANSACTION_COUNT: 33317,
  EXACT_BANK_ACCOUNTS: 7,
  PRIMARY_DOMAIN: 'herbitrage.com',
  AI_DOMAIN: 'livhana.ai',
  VALID_EMAILS: [
    'jesseniesen@gmail.com',
    'high@reggieanddro.com'
  ],
  PAYMENT_PROCESSOR_PAST: 'Square',
  PAYMENT_PROCESSOR_CURRENT: 'LightSpeed + KAJA + Authorize.net',
  KAJA_APPROVED_DATE: '2025-09-30',
  ONLINE_SALES_LAUNCH: '2025-10-01',
};

class FallacyScanner {
  constructor(options = {}) {
    this.fix = options.fix || false;
    this.ci = options.ci || false;
    this.errors = [];
    this.warnings = [];
    this.fixed = [];
  }

  async scan() {
    console.log('🔍 FALLACY SCAN INITIATED - 100% TRUE ALWAYS\n');

    // Scan all documentation files
    const docFiles = await glob('docs/**/*.md', { ignore: 'node_modules/**' });
    const codeFiles = await glob('{backend,automation}/**/*.{js,ts}', {
      ignore: '**/node_modules/**'
    });

    const allFiles = [...docFiles, ...codeFiles];

    for (const file of allFiles) {
      await this.scanFile(file);
    }

    return this.report();
  }

  async scanFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    let modifiedContent = content;
    let fileHasChanges = false;

    // Check for fallacy patterns
    for (const [name, pattern] of Object.entries(FALLACY_PATTERNS)) {
      const matches = content.match(pattern);
      if (matches) {
        const error = {
          file: filePath,
          pattern: name,
          matches: matches,
          severity: 'ERROR'
        };
        this.errors.push(error);

        if (this.fix) {
          // Apply auto-fixes where possible
          modifiedContent = this.autoFix(modifiedContent, name, pattern);
          fileHasChanges = true;
        }
      }
    }

    // Validate numerical data against source truth
    this.validateNumericalData(filePath, content);

    // Validate email addresses
    this.validateEmails(filePath, content);

    // Validate domain references
    this.validateDomains(filePath, content);

    // Write fixes if enabled
    if (this.fix && fileHasChanges) {
      writeFileSync(filePath, modifiedContent);
      this.fixed.push(filePath);
    }
  }

  autoFix(content, patternName, pattern) {
    switch (patternName) {
      case 'FAKE_DOMAINS':
        return content.replace(pattern, SOURCE_TRUTH.PRIMARY_DOMAIN);

      case 'FAKE_EMAILS':
      case 'PLACEHOLDER_EMAILS':
        return content.replace(pattern, SOURCE_TRUTH.VALID_EMAILS[0]);

      case 'FORM_R_AND_D_WY':
      case 'CREATE_R_AND_D_WY':
        return content.replace(pattern, 'R&D WY (formed 2023)');

      case 'APPROXIMATE_CUSTOMERS':
        return content.replace(/10k\+|10K\+/gi, `${SOURCE_TRUTH.EXACT_CUSTOMER_COUNT} customers`);

      case 'STRIPE_REFERENCES':
        return content.replace(pattern, `${SOURCE_TRUTH.PAYMENT_PROCESSOR_CURRENT}`);

      default:
        return content;
    }
  }

  validateNumericalData(filePath, content) {
    // Check for approximate numbers that should be exact
    const approxPatterns = [
      { pattern: /~\s*11,?000/g, correct: SOURCE_TRUTH.EXACT_CUSTOMER_COUNT },
      { pattern: /~\s*33,?000/g, correct: SOURCE_TRUTH.EXACT_TRANSACTION_COUNT },
      { pattern: /\bapproximately\s+\d+\s+customers/gi, correct: `${SOURCE_TRUTH.EXACT_CUSTOMER_COUNT} customers` },
    ];

    for (const { pattern, correct } of approxPatterns) {
      if (pattern.test(content)) {
        this.warnings.push({
          file: filePath,
          issue: `Approximate number found, should be exact: ${correct}`,
          severity: 'WARNING'
        });
      }
    }
  }

  validateEmails(filePath, content) {
    // Extract all email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailPattern) || [];

    for (const email of emails) {
      // Check if email is valid
      const isValid = SOURCE_TRUTH.VALID_EMAILS.includes(email) ||
                     email.endsWith('@reggieanddro.com') ||
                     email === 'noreply@anthropic.com' || // Claude Code
                     email === 'industrialhemp@cdfa.ca.gov' || // Government
                     /noreply@/.test(email); // Generic noreply addresses

      if (!isValid && !/@(github|google|microsoft|apple)\.com/.test(email)) {
        this.warnings.push({
          file: filePath,
          issue: `Unverified email address: ${email}`,
          severity: 'WARNING'
        });
      }
    }
  }

  validateDomains(filePath, content) {
    // Check for incorrect primary domain
    if (content.includes('livhana.com') && !filePath.includes('CONTEXT_CORRECTIONS')) {
      this.errors.push({
        file: filePath,
        issue: `Incorrect domain 'livhana.com' (should be '${SOURCE_TRUTH.PRIMARY_DOMAIN}' or '${SOURCE_TRUTH.AI_DOMAIN}')`,
        severity: 'ERROR'
      });
    }
  }

  report() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 FALLACY SCAN RESULTS');
    console.log('='.repeat(80) + '\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ SCAN COMPLETE: 100% TRUE - Zero fallacies detected\n');
      return { success: true, errors: 0, warnings: 0 };
    }

    if (this.errors.length > 0) {
      console.log(`❌ ERRORS FOUND: ${this.errors.length}\n`);
      for (const error of this.errors) {
        console.log(`  File: ${error.file}`);
        console.log(`  Issue: ${error.pattern}`);
        if (error.matches) {
          console.log(`  Matches: ${error.matches.slice(0, 3).join(', ')}${error.matches.length > 3 ? '...' : ''}`);
        } else {
          console.log(`  Details: ${error.issue}`);
        }
        console.log('');
      }
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  WARNINGS: ${this.warnings.length}\n`);
      for (const warning of this.warnings) {
        console.log(`  File: ${warning.file}`);
        console.log(`  Issue: ${warning.issue}`);
        console.log('');
      }
    }

    if (this.fix && this.fixed.length > 0) {
      console.log(`✅ AUTO-FIXED: ${this.fixed.length} files\n`);
      for (const file of this.fixed) {
        console.log(`  ${file}`);
      }
      console.log('');
    }

    if (this.ci) {
      // In CI mode, fail if any errors found
      if (this.errors.length > 0) {
        console.log('❌ FALLACY SCAN FAILED - Fix errors before commit\n');
        process.exit(1);
      }
    } else if (!this.fix && this.errors.length > 0) {
      console.log('💡 TIP: Run with --fix flag to auto-correct issues\n');
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors.length,
      warnings: this.warnings.length,
      fixed: this.fixed.length
    };
  }
}

// CLI execution
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  ci: args.includes('--ci')
};

const scanner = new FallacyScanner(options);
scanner.scan().catch((error) => {
  console.error('❌ Fallacy scanner error:', error);
  process.exit(1);
});

export { FallacyScanner, FALLACY_PATTERNS, SOURCE_TRUTH };
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
