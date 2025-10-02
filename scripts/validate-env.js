#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Validates .env.master has all required variables for each service
 *
 * Usage: node scripts/validate-env.js [--service=SERVICE_NAME] [--strict]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const SPECIFIC_SERVICE = args.find(arg => arg.startsWith('--service='))?.split('=')[1];
const STRICT_MODE = args.includes('--strict');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  Environment Configuration Validator                   ║');
console.log('║  Validating .env.master completeness                   ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

if (STRICT_MODE) {
  console.log('🔒 STRICT MODE - All variables must be set\n');
}

// Define required variables for each service
const SERVICE_REQUIREMENTS = {
  'integration-service': {
    required: [
      'PORT_INTEGRATION_SERVICE',
      'NODE_ENV',
      'REDIS_HOST',
      'REDIS_PORT',
      'SQUARE_ACCESS_TOKEN',
      'SQUARE_LOCATION_ID',
      'GCP_PROJECT_ID',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'BIGQUERY_ENABLED',
      'BQ_DATASET',
    ],
    optional: [
      'LIGHTSPEED_CLIENT_ID',
      'LIGHTSPEED_ACCOUNT_ID',
      'SENTRY_DSN',
      'NEW_RELIC_LICENSE_KEY',
    ],
  },
  'voice-service': {
    required: [
      'PORT_VOICE_SERVICE',
      'REDIS_HOST',
      'REDIS_PORT',
      'REASONING_GATEWAY_BASE_URL',
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_MODEL_ID',
      'JWT_SECRET',
      'JWT_AUDIENCE',
      'JWT_ISSUER',
    ],
    optional: [
      'ALLOWED_ORIGINS',
    ],
  },
  'reasoning-gateway': {
    required: [
      'PORT_REASONING_GATEWAY',
      'REDIS_HOST',
      'REDIS_PORT',
      'DEEPSEEK_API_KEY',
      'DEEPSEEK_API_BASE_URL',
      'DEEPSEEK_MODEL',
      'JWT_SECRET',
      'REASONING_QUEUE_NAME',
    ],
    optional: [
      'ANTHROPIC_API_KEY',
      'ENABLE_MEMORY_LEARNING',
      'ENABLE_SELF_IMPROVEMENT',
    ],
  },
  'cannabis-service': {
    required: [
      'PORT_CANNABIS_SERVICE',
      'REDIS_HOST',
      'POSTGRES_HOST',
      'POSTGRES_DB',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
    ],
    optional: [],
  },
  'payment-service': {
    required: [
      'PORT_PAYMENT_SERVICE',
      'REDIS_HOST',
      'POSTGRES_HOST',
      'SQUARE_ACCESS_TOKEN',
      'SQUARE_LOCATION_ID',
    ],
    optional: [
      'STRIPE_SECRET_KEY',
      'KAJA_API_KEY',
    ],
  },
  'vibe-cockpit': {
    required: [
      'VITE_API_URL',
      'VITE_REASONING_API_BASE',
      'VITE_VOICE_API_BASE',
      'VITE_BIGQUERY_ENABLED',
      'VITE_SQUARE_ENABLED',
    ],
    optional: [
      'VITE_ELEVENLABS_API_KEY',
      'VITE_AUTONOMOUS_API_BASE',
    ],
  },
  'crisis-engine': {
    required: [
      'PORT_CRISIS_ENGINE',
      'REDIS_HOST',
      'POSTGRES_HOST',
      'DEEPSEEK_API_KEY',
      'CRISIS_DOMAINS',
    ],
    optional: [],
  },
  'content-engine': {
    required: [
      'PORT_CONTENT_ENGINE',
      'ELEVENLABS_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'OUTPUT_DIR',
      'TEMP_DIR',
    ],
    optional: [
      'RUNWAY_API_KEY',
      'PIKA_API_KEY',
      'MAX_COST_PER_EPISODE',
    ],
  },
  'infrastructure': {
    required: [
      'REDIS_HOST',
      'REDIS_PORT',
      'NODE_ENV',
      'LOG_LEVEL',
    ],
    optional: [
      'POSTGRES_HOST',
      'POSTGRES_PORT',
      'POSTGRES_DB',
      'MINIO_HOST',
      'MINIO_PORT',
    ],
  },
};

/**
 * Parse .env file and extract variables
 */
function parseEnvFile(filePath) {
  const envVars = {};
  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      continue;
    }

    // Parse KEY=VALUE
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key] = value;
    }
  }

  return envVars;
}

/**
 * Check if a value is properly set (not empty, not a placeholder)
 */
function isValueSet(value) {
  if (!value || value.trim() === '') {
    return false;
  }

  // Check for common placeholders
  const placeholders = [
    'your-',
    'yourapikey',
    'changeme',
    'placeholder',
    'todo',
    'fixme',
  ];

  const lowerValue = value.toLowerCase();
  for (const placeholder of placeholders) {
    if (lowerValue.includes(placeholder)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate environment variables for a service
 */
function validateService(serviceName, requirements, envVars) {
  const results = {
    serviceName,
    passed: true,
    missing: [],
    unset: [],
    optional_missing: [],
    optional_unset: [],
  };

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Service: ${serviceName}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Check required variables
  console.log('Required Variables:');
  for (const varName of requirements.required) {
    if (!(varName in envVars)) {
      console.log(`  ❌ ${varName}: MISSING`);
      results.missing.push(varName);
      results.passed = false;
    } else if (!isValueSet(envVars[varName])) {
      console.log(`  ⚠️  ${varName}: NOT SET (${envVars[varName]})`);
      results.unset.push(varName);
      if (STRICT_MODE) {
        results.passed = false;
      }
    } else {
      const displayValue = envVars[varName].startsWith('op://')
        ? '[1Password Reference]'
        : envVars[varName].length > 40
        ? `${envVars[varName].substring(0, 37)}...`
        : envVars[varName];
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  }

  // Check optional variables
  if (requirements.optional.length > 0) {
    console.log('\nOptional Variables:');
    for (const varName of requirements.optional) {
      if (!(varName in envVars)) {
        console.log(`  ℹ️  ${varName}: NOT DEFINED`);
        results.optional_missing.push(varName);
      } else if (!isValueSet(envVars[varName])) {
        console.log(`  ⚠️  ${varName}: NOT SET`);
        results.optional_unset.push(varName);
      } else {
        const displayValue = envVars[varName].startsWith('op://')
          ? '[1Password Reference]'
          : envVars[varName].length > 40
          ? `${envVars[varName].substring(0, 37)}...`
          : envVars[varName];
        console.log(`  ✅ ${varName}: ${displayValue}`);
      }
    }
  }

  return results;
}

/**
 * Main validation process
 */
async function validate() {
  // Check if .env.master exists
  const envMasterPath = path.join(ROOT_DIR, '.env.master');
  if (!fs.existsSync(envMasterPath)) {
    console.error('❌ Error: .env.master not found!');
    console.error('   Run: node scripts/migrate-configs.js\n');
    process.exit(1);
  }

  console.log('📄 Loading .env.master...\n');
  const envVars = parseEnvFile(envMasterPath);
  console.log(`✅ Loaded ${Object.keys(envVars).length} environment variables\n`);

  // Validate services
  const allResults = [];
  const servicesToValidate = SPECIFIC_SERVICE
    ? [SPECIFIC_SERVICE]
    : Object.keys(SERVICE_REQUIREMENTS);

  for (const serviceName of servicesToValidate) {
    const requirements = SERVICE_REQUIREMENTS[serviceName];
    if (!requirements) {
      console.error(`❌ Unknown service: ${serviceName}`);
      continue;
    }

    const results = validateService(serviceName, requirements, envVars);
    allResults.push(results);
  }

  // Generate summary
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Validation Summary                                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let totalPassed = 0;
  let totalFailed = 0;
  let totalMissing = 0;
  let totalUnset = 0;

  for (const result of allResults) {
    if (result.passed) {
      console.log(`  ✅ ${result.serviceName}: PASSED`);
      totalPassed++;
    } else {
      console.log(`  ❌ ${result.serviceName}: FAILED`);
      totalFailed++;
      if (result.missing.length > 0) {
        console.log(`     Missing: ${result.missing.join(', ')}`);
        totalMissing += result.missing.length;
      }
      if (result.unset.length > 0) {
        console.log(`     Unset: ${result.unset.join(', ')}`);
        totalUnset += result.unset.length;
      }
    }
  }

  console.log('\n📊 Statistics:');
  console.log(`   - Services validated: ${allResults.length}`);
  console.log(`   - Passed: ${totalPassed}`);
  console.log(`   - Failed: ${totalFailed}`);
  console.log(`   - Missing variables: ${totalMissing}`);
  console.log(`   - Unset variables: ${totalUnset}`);

  if (totalFailed > 0) {
    console.log('\n❌ Validation FAILED');
    console.log('\n📝 Action items:');
    console.log('   1. Review missing/unset variables above');
    console.log('   2. Update .env.master with correct values');
    console.log('   3. Use 1Password references: op://LivHana-Ops-Keys/KEY_NAME/credential');
    console.log('   4. Re-run validation: node scripts/validate-env.js\n');
    process.exit(1);
  } else {
    console.log('\n✅ All validations PASSED!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test services: npm run docker:dev');
    console.log('   2. Verify functionality of each service');
    console.log('   3. Update CI/CD pipelines with new config\n');
    process.exit(0);
  }
}

// Run validation
validate().catch((error) => {
  console.error('\n❌ Validation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
