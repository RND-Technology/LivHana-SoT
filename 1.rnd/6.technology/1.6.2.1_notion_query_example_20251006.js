import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';

/**
 * Example script showing how to query the ingested Notion data
 * Run with: node notion_query_example.js
 */

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET || 'knowledge';

const bigquery = new BigQuery(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});

// Helper function to run queries
async function runQuery(name, sql) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Query: ${name}`);
  console.log('='.repeat(60));

  try {
    const [job] = await bigquery.createQueryJob({ query: sql });
    const [rows] = await job.getQueryResults();

    if (rows.length === 0) {
      console.log('No results found.');
    } else {
      console.table(rows);
    }

    return rows;
  } catch (error) {
    console.error(`Error running query: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('Notion Data Query Examples');
  console.log('='.repeat(60));

  // Query 1: Recent pages
  await runQuery(
    'Most Recently Updated Pages',
    `
    SELECT
      title,
      url,
      FORMAT_TIMESTAMP('%Y-%m-%d %H:%M', last_edited_time) as last_edited,
      content_length,
      archived
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE archived = FALSE
    ORDER BY last_edited_time DESC
    LIMIT 10
    `
  );

  // Query 2: Page statistics
  await runQuery(
    'Page Statistics by Type',
    `
    SELECT
      object_type,
      COUNT(*) as count,
      ROUND(AVG(content_length), 0) as avg_content_length,
      SUM(content_length) as total_content
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    GROUP BY object_type
    `
  );

  // Query 3: Search content
  const searchTerm = process.argv[2] || 'meeting';
  await runQuery(
    `Pages Containing "${searchTerm}"`,
    `
    SELECT
      title,
      url,
      FORMAT_TIMESTAMP('%Y-%m-%d', last_edited_time) as last_edited,
      -- Show snippet of matching content
      SUBSTR(
        content_markdown,
        GREATEST(0, STRPOS(LOWER(content_markdown), LOWER('${searchTerm}')) - 50),
        150
      ) as snippet
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE LOWER(content_markdown) LIKE LOWER('%${searchTerm}%')
      AND archived = FALSE
    ORDER BY last_edited_time DESC
    LIMIT 5
    `
  );

  // Query 4: Page hierarchy
  await runQuery(
    'Top-Level Pages',
    `
    SELECT
      title,
      object_type,
      FORMAT_TIMESTAMP('%Y-%m-%d', created_time) as created,
      content_length
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE parent_type = 'workspace'
      AND archived = FALSE
    ORDER BY title
    LIMIT 10
    `
  );

  // Query 5: Activity timeline
  await runQuery(
    'Recent Activity (Last 7 Days)',
    `
    SELECT
      FORMAT_TIMESTAMP('%Y-%m-%d', last_edited_time) as date,
      COUNT(*) as pages_edited
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE last_edited_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      AND archived = FALSE
    GROUP BY date
    ORDER BY date DESC
    `
  );

  // Query 6: Export summary
  await runQuery(
    'Export Summary',
    `
    SELECT
      COUNT(*) as total_pages,
      COUNT(DISTINCT page_id) as unique_pages,
      COUNTIF(archived = FALSE) as active_pages,
      COUNTIF(archived = TRUE) as archived_pages,
      COUNTIF(object_type = 'page') as pages,
      COUNTIF(object_type = 'database') as databases,
      SUM(content_length) as total_content_chars,
      MAX(exported_at) as latest_export
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    `
  );

  // Query 7: Longest pages
  await runQuery(
    'Longest Pages (Top 5)',
    `
    SELECT
      title,
      url,
      content_length,
      FORMAT_TIMESTAMP('%Y-%m-%d', last_edited_time) as last_edited
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE archived = FALSE
    ORDER BY content_length DESC
    LIMIT 5
    `
  );

  // Query 8: Pages with icons
  await runQuery(
    'Pages with Emoji Icons',
    `
    SELECT
      icon_emoji,
      title,
      url
    FROM \`${BIGQUERY_DATASET}.notion_pages\`
    WHERE icon_emoji IS NOT NULL
      AND archived = FALSE
    LIMIT 10
    `
  );

  console.log('\n' + '='.repeat(60));
  console.log('Query Examples Complete');
  console.log('='.repeat(60));
  console.log('\nTips:');
  console.log('- Search for specific terms: node notion_query_example.js "your search term"');
  console.log('- See more queries in: NOTION_BIGQUERY_QUERIES.sql');
  console.log('- View in BigQuery Console: https://console.cloud.google.com/bigquery');
  console.log('');
}

main().catch((error) => {
  console.error('Query example failed:', error);
  process.exit(1);
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
