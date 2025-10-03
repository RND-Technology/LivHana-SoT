#!/usr/bin/env node
/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 */
const fs = require('fs');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretMigrator {
  constructor({ projectId, dryRun = false }) {
    this.projectId = projectId;
    this.dryRun = dryRun;
    this.client = new SecretManagerServiceClient();
  }

  /**
   * Parse .env file
   */
  parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const secrets = {};

    content.split('\n').forEach(line => {
      line = line.trim();

      // Skip comments and empty lines
      if (line.startsWith('#') || !line) {
        return;
      }

      // Parse KEY=VALUE
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Remove quotes if present
        secrets[key] = value.replace(/^["']|["']$/g, '');
      }
    });

    return secrets;
  }

  /**
   * Determine secret priority
   */
  getSecretPriority(key) {
    // P0 - Critical secrets
    if (key.includes('JWT_') || key.includes('PASSWORD') || key.includes('SECRET_KEY')) {
      return 'p0';
    }

    // P1 - API keys
    if (key.includes('API_KEY') || key.includes('ACCESS_TOKEN') || key.includes('APPLICATION_ID')) {
      return 'p1';
    }

    // P2 - Integration secrets
    if (key.includes('TWILIO_') || key.includes('STRIPE_') || key.includes('SMTP_')) {
      return 'p2';
    }

    // P3 - Monitoring
    if (key.includes('SENTRY_') || key.includes('NEWRELIC_') || key.includes('DATADOG_')) {
      return 'p3';
    }

    return 'p4';
  }

  /**
   * Create secret in GCP Secret Manager
   */
  async createSecret(name, value, labels = {}) {
    const parent = `projects/${this.projectId}`;

    try {
      // Check if secret exists
      const secretPath = `${parent}/secrets/${name}`;
      try {
        await this.client.getSecret({ name: secretPath });
        console.info(`  ✓ Secret ${name} already exists, adding new version`);
      } catch (error) {
        if (error.code === 5) { // NOT_FOUND
          // Create new secret
          if (this.dryRun) {
            console.info(`  [DRY RUN] Would create secret: ${name}`);
          } else {
            await this.client.createSecret({
              parent,
              secretId: name,
              secret: {
                replication: {
                  automatic: {}
                },
                labels
              }
            });
            console.info(`  ✓ Created secret: ${name}`);
          }
        } else {
          throw error;
        }
      }

      // Add secret version
      if (this.dryRun) {
        console.info(`  [DRY RUN] Would add version to ${name} (value length: ${value.length} chars)`);
      } else {
        await this.client.addSecretVersion({
          parent: secretPath,
          payload: {
            data: Buffer.from(value, 'utf8')
          }
        });
        console.info(`  ✓ Added version to secret: ${name}`);
      }

      return true;
    } catch (error) {
      console.error(`  ✗ Failed to create/update secret ${name}:`, error.message);
      return false;
    }
  }

  /**
   * Migrate secrets from .env file
   */
  async migrate(envFilePath, serviceName, environment = 'production') {
    console.info('\n=== GCP Secret Manager Migration ===\n');
    console.info(`Project ID: ${this.projectId}`);
    console.info(`Service: ${serviceName}`);
    console.info(`Environment: ${environment}`);
    console.info(`Env File: ${envFilePath}`);
    console.info(`Dry Run: ${this.dryRun ? 'YES' : 'NO'}\n`);

    if (this.dryRun) {
      console.info('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    // Parse .env file
    const secrets = this.parseEnvFile(envFilePath);
    const secretCount = Object.keys(secrets).length;

    console.info(`Found ${secretCount} secrets in .env file\n`);

    // Group secrets by priority
    const secretsByPriority = {};
    Object.keys(secrets).forEach(key => {
      const priority = this.getSecretPriority(key);
      if (!secretsByPriority[priority]) {
        secretsByPriority[priority] = [];
      }
      secretsByPriority[priority].push(key);
    });

    // Display summary
    console.info('Secrets by Priority:');
    ['p0', 'p1', 'p2', 'p3', 'p4'].forEach(priority => {
      const count = secretsByPriority[priority]?.length || 0;
      if (count > 0) {
        console.info(`  ${priority.toUpperCase()}: ${count} secrets`);
      }
    });
    console.info('');

    // Migrate secrets
    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    for (const priority of ['p0', 'p1', 'p2', 'p3', 'p4']) {
      const secretKeys = secretsByPriority[priority] || [];
      if (secretKeys.length === 0) continue;

      console.info(`\nMigrating ${priority.toUpperCase()} secrets (${secretKeys.length}):`);

      for (const key of secretKeys) {
        const value = secrets[key];

        // Skip empty values
        if (!value || value.trim() === '') {
          console.info(`  ⊘ Skipping ${key} (empty value)`);
          results.skipped++;
          continue;
        }

        // Skip non-secret values
        if (key.includes('_URL') || key.includes('_HOST') || key.includes('_PORT')) {
          console.info(`  ⊘ Skipping ${key} (not a secret)`);
          results.skipped++;
          continue;
        }

        const labels = {
          environment,
          service: serviceName,
          tier: priority,
          migrated: 'true',
          migration_date: new Date().toISOString().split('T')[0]
        };

        const success = await this.createSecret(key, value, labels);
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      }
    }

    // Summary
    console.info('\n=== Migration Summary ===\n');
    console.info(`Total secrets processed: ${secretCount}`);
    console.info(`✓ Successfully migrated: ${results.success}`);
    console.info(`⊘ Skipped: ${results.skipped}`);
    console.info(`✗ Failed: ${results.failed}`);

    if (this.dryRun) {
      console.info('\n⚠️  This was a DRY RUN - no changes were made');
      console.info('Run without --dry-run to perform actual migration\n');
    } else {
      console.info('\n✓ Migration complete!\n');
      console.info('Next steps:');
      console.info('1. Grant service account access to secrets');
      console.info('2. Update deployment configuration to use Secret Manager');
      console.info('3. Test application with secrets from Secret Manager');
      console.info('4. Remove .env file from production deployment\n');
    }

    return results;
  }

  /**
   * Grant access to service account
   */
  async grantAccess(secretName, serviceAccountEmail) {
    const secretPath = `projects/${this.projectId}/secrets/${secretName}`;

    if (this.dryRun) {
      console.info(`[DRY RUN] Would grant access to ${serviceAccountEmail} for ${secretName}`);
      return true;
    }

    try {
      await this.client.setIamPolicy({
        resource: secretPath,
        policy: {
          bindings: [
            {
              role: 'roles/secretmanager.secretAccessor',
              members: [`serviceAccount:${serviceAccountEmail}`]
            }
          ]
        }
      });

      console.info(`✓ Granted access to ${serviceAccountEmail} for ${secretName}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to grant access for ${secretName}:`, error.message);
      return false;
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  const getArg = (name) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : null;
  };

  const hasFlag = (name) => args.includes(name);

  const envFile = getArg('--env-file');
  const projectId = getArg('--project-id') || process.env.GCP_PROJECT;
  const service = getArg('--service') || 'unknown';
  const environment = getArg('--environment') || 'production';
  const dryRun = hasFlag('--dry-run');
  const help = hasFlag('--help') || hasFlag('-h');

  if (help) {
    console.info(`
GCP Secret Manager Migration Script

Usage:
  node migrate-to-gcp.js [options]

Options:
  --env-file FILE       Path to .env file (required)
  --project-id ID       GCP project ID (required)
  --service NAME        Service name (default: unknown)
  --environment ENV     Environment (default: production)
  --dry-run             Preview changes without making them
  --help, -h            Show this help message

Examples:
  # Dry run
  node migrate-to-gcp.js \\
    --env-file=backend/integration-service/.env \\
    --project-id=livhana-sot \\
    --service=integration-service \\
    --dry-run

  # Actual migration
  node migrate-to-gcp.js \\
    --env-file=backend/integration-service/.env \\
    --project-id=livhana-sot \\
    --service=integration-service
    `);
    process.exit(0);
  }

  if (!envFile || !projectId) {
    console.error('Error: --env-file and --project-id are required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  if (!fs.existsSync(envFile)) {
    console.error(`Error: .env file not found: ${envFile}`);
    process.exit(1);
  }

  const migrator = new SecretMigrator({ projectId, dryRun });

  migrator.migrate(envFile, service, environment)
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { SecretMigrator };

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02