import 'dotenv/config';
import { Client } from '@notionhq/client';
import { BigQuery } from '@google-cloud/bigquery';

// Configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET || 'knowledge';

console.log('\n===========================================');
console.log('Notion Ingestion Pipeline - Connectivity Test');
console.log('===========================================\n');

// Test results tracker
const results = {
  passed: [],
  failed: []
};

function pass(test) {
  console.log(`✅ ${test}`);
  results.passed.push(test);
}

function fail(test, error) {
  console.log(`❌ ${test}`);
  console.log(`   Error: ${error.message}`);
  results.failed.push({ test, error: error.message });
}

// Test 1: Check environment variables
console.log('1. Checking environment variables...');
try {
  if (!NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY not set');
  }
  pass('NOTION_API_KEY is set');

  if (GCP_PROJECT_ID) {
    pass(`GCP_PROJECT_ID is set: ${GCP_PROJECT_ID}`);
  } else {
    console.log('⚠️  GCP_PROJECT_ID not set (will use default credentials)');
  }

  pass(`BigQuery dataset: ${BIGQUERY_DATASET}`);
} catch (error) {
  fail('Environment variables', error);
  process.exit(1);
}

console.log('');

// Test 2: Test Notion API connection
console.log('2. Testing Notion API connection...');
try {
  const notion = new Client({ auth: NOTION_API_KEY });

  // Try to search (this will fail if API key is invalid)
  const searchResult = await notion.search({
    page_size: 1
  });

  pass('Notion API connection successful');
  pass(`Found ${searchResult.results.length > 0 ? 'pages in' : 'empty'} workspace`);

  // Get workspace info by checking first page
  if (searchResult.results.length > 0) {
    const firstPage = searchResult.results[0];
    console.log(`   Sample page: "${firstPage.properties?.title?.title?.[0]?.plain_text || 'Untitled'}"`);
  }
} catch (error) {
  fail('Notion API connection', error);
  if (error.code === 'unauthorized') {
    console.log('\n   Troubleshooting:');
    console.log('   1. Check that your NOTION_API_KEY is correct');
    console.log('   2. Verify the integration is active at https://www.notion.so/my-integrations');
    console.log('   3. Make sure you have shared pages with the integration\n');
  }
  process.exit(1);
}

console.log('');

// Test 3: Test BigQuery connection
console.log('3. Testing BigQuery connection...');
try {
  const bigquery = new BigQuery(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});

  // Try to get project info
  const [datasets] = await bigquery.getDatasets({ maxResults: 1 });

  pass('BigQuery connection successful');

  // Check if our dataset exists
  const dataset = bigquery.dataset(BIGQUERY_DATASET);
  const [exists] = await dataset.exists();

  if (exists) {
    pass(`Dataset "${BIGQUERY_DATASET}" exists`);

    // Check if table exists
    const table = dataset.table('notion_pages');
    const [tableExists] = await table.exists();

    if (tableExists) {
      pass('Table "notion_pages" exists');

      // Get row count
      const [job] = await bigquery.createQueryJob({
        query: `SELECT COUNT(*) as count FROM \`${BIGQUERY_DATASET}.notion_pages\``
      });
      const [rows] = await job.getQueryResults();
      console.log(`   Current row count: ${rows[0].count}`);
    } else {
      console.log('⚠️  Table "notion_pages" does not exist (will be created on first run)');
    }
  } else {
    console.log(`⚠️  Dataset "${BIGQUERY_DATASET}" does not exist (will be created on first run)`);
  }
} catch (error) {
  fail('BigQuery connection', error);
  console.log('\n   Troubleshooting:');
  console.log('   1. Ensure BigQuery API is enabled in your GCP project');
  console.log('   2. Set up authentication:');
  console.log('      gcloud auth application-default login');
  console.log('   3. Or use a service account:');
  console.log('      export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json\n');
  process.exit(1);
}

console.log('');

// Test 4: Check export directory
console.log('4. Checking export directory...');
try {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const exportDir = path.join(__dirname, '../../data/notion_export');

  try {
    await fs.access(exportDir);
    pass(`Export directory exists: ${exportDir}`);

    // Check if writable
    const testFile = path.join(exportDir, '.write_test');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    pass('Export directory is writable');
  } catch {
    console.log('⚠️  Export directory does not exist (will be created on first run)');
    pass('Export directory can be created');
  }
} catch (error) {
  fail('Export directory check', error);
}

console.log('');

// Test 5: Test Notion API pagination
console.log('5. Testing Notion API features...');
try {
  const notion = new Client({ auth: NOTION_API_KEY });

  // Test searching pages
  const pageSearch = await notion.search({
    filter: { property: 'object', value: 'page' },
    page_size: 10
  });
  pass(`Found ${pageSearch.results.length} pages`);

  // Test searching databases
  const dbSearch = await notion.search({
    filter: { property: 'object', value: 'database' },
    page_size: 10
  });
  pass(`Found ${dbSearch.results.length} databases`);

  // Test block retrieval if we have pages
  if (pageSearch.results.length > 0) {
    const firstPage = pageSearch.results[0];
    const blocks = await notion.blocks.children.list({
      block_id: firstPage.id,
      page_size: 1
    });
    pass(`Block retrieval working (found ${blocks.results.length} blocks)`);
  }

} catch (error) {
  fail('Notion API features', error);
  process.exit(1);
}

console.log('');

// Print summary
console.log('===========================================');
console.log('Test Summary');
console.log('===========================================\n');

console.log(`✅ Passed: ${results.passed.length}`);
if (results.failed.length > 0) {
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('\nFailed tests:');
  results.failed.forEach(({ test, error }) => {
    console.log(`  - ${test}: ${error}`);
  });
  console.log('');
  process.exit(1);
} else {
  console.log('❌ Failed: 0\n');
  console.log('🎉 All tests passed! You are ready to run the ingestion.\n');
  console.log('Run the ingestion with:');
  console.log('  npm run notion:ingest\n');
  console.log('Or:');
  console.log('  node notion_ingest.js\n');
}
// Last optimized: 2025-10-02
