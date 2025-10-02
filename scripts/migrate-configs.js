#!/usr/bin/env node

/**
 * Configuration Migration Script
 * Migrates from scattered config files to consolidated .env.master
 *
 * Usage: node scripts/migrate-configs.js [--dry-run] [--backup]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CREATE_BACKUP = args.includes('--backup');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  LivHana Configuration Migration Script               ║');
console.log('║  Consolidating scattered configs → .env.master         ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
}

if (CREATE_BACKUP) {
  console.log('💾 BACKUP MODE - Creating backups before migration\n');
}

// Files to migrate (old config files)
const CONFIG_FILES_TO_MIGRATE = [
  '.env',
  '.env.local',
  'backend/integration-service/.env',
  'backend/reasoning-gateway/.env',
  'backend/voice-service/.env',
  'frontend/vibe-cockpit/.env.local',
  'empire/content-engine/.env',
  'automation/data-pipelines/.env.square',
  'automation/data-pipelines/.env.lightspeed',
  'automation/data-pipelines/.env.notion',
];

// Files to archive (old docker-compose files)
const DOCKER_COMPOSE_FILES = [
  'docker-compose.yml',
  'docker-compose.empire.yml',
  'docker-compose.bigquery.yml',
  'infra/docker/docker-compose.voice-mode.yml',
];

// Package.json files (for reference only)
const PACKAGE_JSON_FILES = [
  'backend/integration-service/package.json',
  'backend/voice-service/package.json',
  'backend/reasoning-gateway/package.json',
  'backend/cannabis-service/package.json',
  'backend/payment-service/package.json',
  'backend/product-service/package.json',
  'backend/common/package.json',
  'frontend/vibe-cockpit/package.json',
  'empire/crisis-engine/package.json',
  'empire/compliance-engine/package.json',
  'empire/content-engine/package.json',
  'automation/data-pipelines/package.json',
  'automation/tests/playwright/package.json',
  'infra/docker/deepseek-stub/package.json',
];

/**
 * Create backup of a file
 */
function backupFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${fullPath}.backup-${timestamp}`;

  if (!DRY_RUN) {
    fs.copyFileSync(fullPath, backupPath);
    console.log(`  ✅ Backed up: ${filePath} → ${path.basename(backupPath)}`);
  } else {
    console.log(`  📋 Would backup: ${filePath}`);
  }

  return true;
}

/**
 * Archive file to .archive directory
 */
function archiveFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  Not found: ${filePath}`);
    return false;
  }

  const archiveDir = path.join(ROOT_DIR, '.archive', 'pre-consolidation');
  const archivePath = path.join(archiveDir, filePath);

  if (!DRY_RUN) {
    // Create archive directory structure
    fs.mkdirSync(path.dirname(archivePath), { recursive: true });

    // Move file to archive
    fs.renameSync(fullPath, archivePath);
    console.log(`  📦 Archived: ${filePath}`);
  } else {
    console.log(`  📋 Would archive: ${filePath}`);
  }

  return true;
}

/**
 * Create symlink from old location to new consolidated config
 */
function createSymlink(oldPath, targetPath) {
  const oldFullPath = path.join(ROOT_DIR, oldPath);
  const targetFullPath = path.join(ROOT_DIR, targetPath);

  if (!DRY_RUN) {
    const relativePath = path.relative(path.dirname(oldFullPath), targetFullPath);
    fs.symlinkSync(relativePath, oldFullPath);
    console.log(`  🔗 Created symlink: ${oldPath} → ${targetPath}`);
  } else {
    console.log(`  📋 Would create symlink: ${oldPath} → ${targetPath}`);
  }
}

/**
 * Main migration process
 */
async function migrate() {
  let migratedCount = 0;
  let archivedCount = 0;
  let symlinkCount = 0;

  // Step 1: Backup and archive old .env files
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 1: Migrating .env files');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const configFile of CONFIG_FILES_TO_MIGRATE) {
    const fullPath = path.join(ROOT_DIR, configFile);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  Skipping (not found): ${configFile}`);
      continue;
    }

    console.log(`\n📄 Processing: ${configFile}`);

    // Backup if requested
    if (CREATE_BACKUP) {
      backupFile(configFile);
    }

    // Archive the file
    if (archiveFile(configFile)) {
      archivedCount++;
    }

    // Create symlink to .env.master
    createSymlink(configFile, '.env.master');
    symlinkCount++;
    migratedCount++;
  }

  // Step 2: Archive old docker-compose files
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 2: Archiving old docker-compose files');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const composeFile of DOCKER_COMPOSE_FILES) {
    const fullPath = path.join(ROOT_DIR, composeFile);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  Skipping (not found): ${composeFile}`);
      continue;
    }

    console.log(`\n📄 Processing: ${composeFile}`);

    if (CREATE_BACKUP) {
      backupFile(composeFile);
    }

    if (archiveFile(composeFile)) {
      archivedCount++;
    }
  }

  // Step 3: Report on package.json files (informational only)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 3: Package.json files (workspace managed)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let existingPackages = 0;
  for (const packageFile of PACKAGE_JSON_FILES) {
    const fullPath = path.join(ROOT_DIR, packageFile);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ Found: ${packageFile}`);
      existingPackages++;
    } else {
      console.log(`  ⚠️  Missing: ${packageFile}`);
    }
  }

  // Step 4: Create migration summary document
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 4: Creating migration summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const summary = `
# Configuration Migration Summary
Generated: ${new Date().toISOString()}

## Migration Statistics
- Config files migrated: ${migratedCount}
- Files archived: ${archivedCount}
- Symlinks created: ${symlinkCount}
- Package.json files found: ${existingPackages}/${PACKAGE_JSON_FILES.length}

## New Consolidated Structure
\`\`\`
LivHana-SoT/
├── .env.master                     ← ONE SOURCE OF TRUTH
├── docker-compose.unified.yml      ← ONE DOCKER COMPOSE
├── package.workspace.json          ← ONE PACKAGE.JSON (workspace root)
├── eslint.config.js                ← ONE ESLINT CONFIG
└── jest.config.js                  ← ONE JEST CONFIG (to be created)
\`\`\`

## Migrated Files
${CONFIG_FILES_TO_MIGRATE.map(f => `- ${f} → .env.master (symlink)`).join('\n')}

## Archived Docker Compose Files
${DOCKER_COMPOSE_FILES.map(f => `- ${f}`).join('\n')}

## Next Steps
1. Review .env.master and fill in any missing 1Password references
2. Test services with: \`docker-compose -f docker-compose.unified.yml --profile dev up\`
3. Run validation: \`node scripts/validate-env.js\`
4. Update CI/CD pipelines to use new config structure
5. Update documentation with new config instructions

## Rollback Instructions
If you need to rollback:
1. Remove symlinks: \`find . -type l -name ".env*" -delete\`
2. Restore from .archive/pre-consolidation/
3. Or restore from .backup-TIMESTAMP files

## Workspace Commands
- Install all deps: \`npm run install:all\`
- Run all tests: \`npm run test\`
- Start dev mode: \`npm run dev:all\`
- Start with Docker: \`npm run docker:dev\`
`;

  const summaryPath = path.join(ROOT_DIR, 'MIGRATION_SUMMARY.md');
  if (!DRY_RUN) {
    fs.writeFileSync(summaryPath, summary);
    console.log(`  ✅ Created: MIGRATION_SUMMARY.md`);
  } else {
    console.log(`  📋 Would create: MIGRATION_SUMMARY.md`);
  }

  // Final summary
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║  Migration Complete!                                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary:`);
  console.log(`   - Config files migrated: ${migratedCount}`);
  console.log(`   - Files archived: ${archivedCount}`);
  console.log(`   - Symlinks created: ${symlinkCount}`);
  console.log(`   - Package.json files: ${existingPackages}/${PACKAGE_JSON_FILES.length}`);

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review .env.master for any missing values');
    console.log('   2. Run: node scripts/validate-env.js');
    console.log('   3. Test: npm run docker:dev');
  }
}

// Run migration
migrate().catch((error) => {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
