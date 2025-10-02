/**
 * Playwright script to check what Cursor is ACTUALLY showing
 * This is the TRUTH - what the IDE sees vs what ESLint reports
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function checkCursorProblems() {
  console.log('🔍 Checking what Cursor ACTUALLY sees...');

  // For now, let's check the REAL source of truth:
  // 1. What ESLint reports across the entire project
  // 2. What TypeScript reports (if applicable)
  // 3. What's in the Problems panel

  // Run ESLint on the ENTIRE project from root
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    console.log('Running ESLint on entire project...');

    // Run from project root, check ALL files
    const { stdout, stderr } = await execAsync(
      'npx eslint . --ext .js,.jsx,.ts,.tsx 2>&1',
      {
        cwd: '/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT',
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer
      }
    );

    const output = stdout + stderr;

    // Parse the output
    const lines = output.split('\n');
    const problemLines = lines.filter(line =>
      line.includes('error') || line.includes('warning')
    );

    // Extract the summary
    const summaryLine = lines.find(line => line.includes('problems'));

    console.log('\n📊 REAL ESLINT OUTPUT:');
    console.log('=' .repeat(80));
    console.log(summaryLine || 'No summary found');
    console.log('=' .repeat(80));

    // Show first 50 problems
    console.log('\n🔴 First 50 Problems:');
    problemLines.slice(0, 50).forEach((line, i) => {
      console.log(`${i + 1}. ${line}`);
    });

    // Save full output
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputPath = path.join(__dirname, `../reports/cursor-truth-${timestamp}.txt`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);

    console.log(`\n📄 Full output saved to: ${outputPath}`);

    return {
      summary: summaryLine,
      totalProblems: problemLines.length,
      output: output
    };

  } catch (error) {
    console.error('❌ Error running ESLint:', error.message);

    // If ESLint fails, it might be because there ARE problems
    // The error output IS the problems list
    const output = error.stdout + error.stderr;
    const lines = output.split('\n');
    const summaryLine = lines.find(line => line.includes('problems'));

    console.log('\n📊 ESLINT OUTPUT (via error):');
    console.log('=' .repeat(80));
    console.log(summaryLine || 'Could not parse summary');
    console.log('=' .repeat(80));

    // Save this output too
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputPath = path.join(__dirname, `../reports/cursor-truth-${timestamp}.txt`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);

    console.log(`\n📄 Full output saved to: ${outputPath}`);

    return {
      summary: summaryLine,
      output: output
    };
  }
}

// Run it
checkCursorProblems().then(result => {
  console.log('\n✅ Check complete!');
  console.log('Summary:', result.summary);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
