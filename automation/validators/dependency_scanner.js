#!/usr/bin/env node
/**
 * Automated Dependency Scanner
 * Detects unused dependencies across all services
 * THE BEST CODE IS NO CODE - Remove all cruft
 *
 * Usage: node dependency_scanner.js [--remove]
 */

import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

class DependencyScanner {
  constructor(options = {}) {
    this.remove = options.remove || false;
    this.unused = [];
    this.services = [];
  }

  async scan() {
    console.log('🔍 DEPENDENCY SCAN INITIATED - Best code is no code\n');

    // Find all package.json files
    const packageFiles = await glob('backend/*/package.json', {
      ignore: '**/node_modules/**'
    });

    // Add common package.json
    packageFiles.push('backend/common/package.json');

    for (const packageFile of packageFiles) {
      await this.scanService(packageFile);
    }

    return this.report();
  }

  async scanService(packagePath) {
    const serviceDir = path.dirname(packagePath);
    const serviceName = path.basename(serviceDir);

    console.log(`Scanning ${serviceName}...`);

    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const dependencies = packageJson.dependencies || {};

    // Find all JS/TS files in service
    const codeFiles = await glob(`${serviceDir}/**/*.{js,ts}`, {
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    // Check each dependency
    for (const [depName, depVersion] of Object.entries(dependencies)) {
      const isUsed = await this.isDependencyUsed(depName, codeFiles);

      if (!isUsed) {
        this.unused.push({
          service: serviceName,
          package: depName,
          version: depVersion,
          packagePath: packagePath
        });
      }
    }

    this.services.push({
      name: serviceName,
      path: packagePath,
      totalDeps: Object.keys(dependencies).length,
      unusedDeps: this.unused.filter(u => u.service === serviceName).length
    });
  }

  async isDependencyUsed(depName, codeFiles) {
    // Create regex patterns to check for imports
    const patterns = [
      new RegExp(`require\\s*\\(\\s*['"\`]${depName}['"\`]\\s*\\)`, 'g'),
      new RegExp(`from\\s+['"\`]${depName}['"\`]`, 'g'),
      new RegExp(`import\\s+['"\`]${depName}['"\`]`, 'g'),
      new RegExp(`import\\s+.+\\s+from\\s+['"\`]${depName}['"\`]`, 'g'),
    ];

    for (const file of codeFiles) {
      const content = readFileSync(file, 'utf-8');

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return true;
        }
      }
    }

    return false;
  }

  removeDependencies() {
    if (!this.remove || this.unused.length === 0) return;

    console.log('\n🗑️  Removing unused dependencies...\n');

    // Group by package file
    const byPackage = {};
    for (const dep of this.unused) {
      if (!byPackage[dep.packagePath]) {
        byPackage[dep.packagePath] = [];
      }
      byPackage[dep.packagePath].push(dep.package);
    }

    // Remove from each package.json
    for (const [packagePath, deps] of Object.entries(byPackage)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

      for (const dep of deps) {
        delete packageJson.dependencies[dep];
        console.log(`  ✓ Removed ${dep} from ${path.basename(path.dirname(packagePath))}`);
      }

      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    }

    console.log('\n✅ Run npm install in each service to update lock files\n');
  }

  report() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEPENDENCY SCAN RESULTS');
    console.log('='.repeat(80) + '\n');

    // Service summary
    console.log('📦 Services Scanned:\n');
    for (const service of this.services) {
      const status = service.unusedDeps === 0 ? '✅' : '⚠️ ';
      console.log(`  ${status} ${service.name}: ${service.totalDeps} dependencies, ${service.unusedDeps} unused`);
    }
    console.log('');

    if (this.unused.length === 0) {
      console.log('✅ SCAN COMPLETE: All dependencies actively used (Best code is no code!)\n');
      return { success: true, unused: 0 };
    }

    console.log(`⚠️  UNUSED DEPENDENCIES FOUND: ${this.unused.length}\n`);

    for (const dep of this.unused) {
      console.log(`  Service: ${dep.service}`);
      console.log(`  Package: ${dep.package}@${dep.version}`);
      console.log(`  File: ${dep.packagePath}`);
      console.log('');
    }

    if (!this.remove) {
      console.log('💡 TIP: Run with --remove flag to automatically remove unused dependencies\n');
    } else {
      this.removeDependencies();
    }

    return {
      success: false,
      unused: this.unused.length,
      details: this.unused
    };
  }
}

// CLI execution
const args = process.argv.slice(2);
const options = {
  remove: args.includes('--remove')
};

const scanner = new DependencyScanner(options);
scanner.scan().catch((error) => {
  console.error('❌ Dependency scanner error:', error);
  process.exit(1);
});

export { DependencyScanner };
// Last optimized: 2025-10-02
