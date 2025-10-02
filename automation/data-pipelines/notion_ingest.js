import 'dotenv/config';
import { Client } from '@notionhq/client';
import { BigQuery } from '@google-cloud/bigquery';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET || 'knowledge';
const BIGQUERY_TABLE = 'notion_pages';
const EXPORT_DIR = path.join(__dirname, '../../data/notion_export');
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Validate required environment variables
if (!NOTION_API_KEY) {
  throw new Error('Missing required environment variable: NOTION_API_KEY');
}

// Initialize clients
const notion = new Client({ auth: NOTION_API_KEY });
const bigquery = new BigQuery(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});

// Structured logging
const log = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message, error = null, meta = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null,
      ...meta
    }));
  }
};

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, context = '', retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isRateLimitError = error.code === 'rate_limited' || error.status === 429;

      if (isLastAttempt || (!isRateLimitError && error.status !== 500 && error.status !== 503)) {
        throw error;
      }

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      log.warn(`Retry attempt ${attempt}/${retries} for ${context}`, {
        delay,
        error: error.message
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Convert Notion rich text to plain text
 */
function richTextToPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(text => text.plain_text || '').join('');
}

/**
 * Convert Notion block to markdown
 */
function blockToMarkdown(block) {
  const type = block.type;

  if (!block[type]) {
    return '';
  }

  const content = block[type];

  switch (type) {
    case 'paragraph':
      return richTextToPlainText(content.rich_text) + '\n\n';

    case 'heading_1':
      return `# ${richTextToPlainText(content.rich_text)}\n\n`;

    case 'heading_2':
      return `## ${richTextToPlainText(content.rich_text)}\n\n`;

    case 'heading_3':
      return `### ${richTextToPlainText(content.rich_text)}\n\n`;

    case 'bulleted_list_item':
      return `- ${richTextToPlainText(content.rich_text)}\n`;

    case 'numbered_list_item':
      return `1. ${richTextToPlainText(content.rich_text)}\n`;

    case 'to_do': {
      const checkbox = content.checked ? '[x]' : '[ ]';
      return `- ${checkbox} ${richTextToPlainText(content.rich_text)}\n`;
    }

    case 'toggle':
      return `<details>\n<summary>${richTextToPlainText(content.rich_text)}</summary>\n\n`;

    case 'code': {
      const language = content.language || '';
      const code = richTextToPlainText(content.rich_text);
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }

    case 'quote':
      return `> ${richTextToPlainText(content.rich_text)}\n\n`;

    case 'callout': {
      const icon = content.icon?.emoji || '';
      return `${icon} **Callout:** ${richTextToPlainText(content.rich_text)}\n\n`;
    }

    case 'divider':
      return '---\n\n';

    case 'table_of_contents':
      return '_[Table of Contents]_\n\n';

    case 'breadcrumb':
      return '_[Breadcrumb]_\n\n';

    case 'equation':
      return `$$${content.expression}$$\n\n`;

    case 'image': {
      const imageUrl = content.file?.url || content.external?.url || '';
      const caption = richTextToPlainText(content.caption);
      return `![${caption}](${imageUrl})\n\n`;
    }

    case 'video': {
      const videoUrl = content.file?.url || content.external?.url || '';
      return `[Video](${videoUrl})\n\n`;
    }

    case 'file': {
      const fileUrl = content.file?.url || content.external?.url || '';
      const fileName = richTextToPlainText(content.caption) || 'File';
      return `[${fileName}](${fileUrl})\n\n`;
    }

    case 'bookmark':
      return `[Bookmark](${content.url})\n\n`;

    case 'link_preview':
      return `[Link](${content.url})\n\n`;

    case 'embed':
      return `[Embed](${content.url})\n\n`;

    case 'table':
      return '_[Table]_\n\n';

    case 'table_row': {
      const cells = content.cells?.map(cell => richTextToPlainText(cell)).join(' | ') || '';
      return `| ${cells} |\n`;
    }

    case 'column_list':
      return '_[Column Layout]_\n\n';

    case 'column':
      return '';

    case 'synced_block':
      return '_[Synced Block]_\n\n';

    case 'template':
      return `_[Template: ${richTextToPlainText(content.rich_text)}]_\n\n`;

    case 'link_to_page':
      return `_[Link to Page: ${content.page_id}]_\n\n`;

    case 'unsupported':
      return '_[Unsupported Block Type]_\n\n';

    default:
      log.warn(`Unknown block type: ${type}`, { blockId: block.id });
      return '';
  }
}

/**
 * Fetch all blocks for a page with pagination
 */
async function fetchPageBlocks(pageId) {
  const blocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await withRetry(
      async () => notion.blocks.children.list({
        block_id: pageId,
        start_cursor: startCursor,
        page_size: 100
      }),
      `Fetching blocks for page ${pageId}`
    );

    blocks.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return blocks;
}

/**
 * Convert page blocks to markdown recursively
 */
async function pageToMarkdown(pageId, depth = 0) {
  if (depth > 10) {
    log.warn('Max recursion depth reached', { pageId, depth });
    return '';
  }

  const blocks = await fetchPageBlocks(pageId);
  let markdown = '';

  for (const block of blocks) {
    markdown += blockToMarkdown(block);

    // Handle nested blocks (children)
    if (block.has_children) {
      try {
        const childMarkdown = await pageToMarkdown(block.id, depth + 1);
        markdown += childMarkdown;
      } catch (error) {
        log.warn(`Failed to fetch child blocks`, {
          blockId: block.id,
          error: error.message
        });
      }
    }
  }

  return markdown;
}

/**
 * Get page properties as metadata
 */
function extractPageProperties(page) {
  const properties = {};

  for (const [key, value] of Object.entries(page.properties)) {
    try {
      switch (value.type) {
        case 'title':
          properties[key] = richTextToPlainText(value.title);
          break;
        case 'rich_text':
          properties[key] = richTextToPlainText(value.rich_text);
          break;
        case 'number':
          properties[key] = value.number;
          break;
        case 'select':
          properties[key] = value.select?.name || null;
          break;
        case 'multi_select':
          properties[key] = value.multi_select?.map(s => s.name).join(', ') || null;
          break;
        case 'date':
          properties[key] = value.date?.start || null;
          break;
        case 'checkbox':
          properties[key] = value.checkbox;
          break;
        case 'url':
          properties[key] = value.url;
          break;
        case 'email':
          properties[key] = value.email;
          break;
        case 'phone_number':
          properties[key] = value.phone_number;
          break;
        case 'status':
          properties[key] = value.status?.name || null;
          break;
        default:
          properties[key] = null;
      }
    } catch (error) {
      log.warn(`Failed to extract property ${key}`, { error: error.message });
      properties[key] = null;
    }
  }

  return properties;
}

/**
 * Get page title from properties
 */
function getPageTitle(page) {
  // Try to find title property
  for (const [key, value] of Object.entries(page.properties)) {
    if (value.type === 'title' && value.title) {
      const title = richTextToPlainText(value.title);
      if (title) return title;
    }
  }

  // Fallback to "Untitled"
  return 'Untitled';
}

/**
 * Search all pages in workspace with pagination
 */
async function searchAllPages() {
  const pages = [];
  let hasMore = true;
  let startCursor = undefined;

  log.info('Starting search for all pages and databases');

  while (hasMore) {
    const response = await withRetry(
      async () => notion.search({
        filter: { property: 'object', value: 'page' },
        start_cursor: startCursor,
        page_size: 100
      }),
      'Searching pages'
    );

    pages.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;

    log.info(`Fetched ${response.results.length} pages`, {
      totalSoFar: pages.length,
      hasMore
    });
  }

  // Also search for databases
  hasMore = true;
  startCursor = undefined;

  while (hasMore) {
    const response = await withRetry(
      async () => notion.search({
        filter: { property: 'object', value: 'database' },
        start_cursor: startCursor,
        page_size: 100
      }),
      'Searching databases'
    );

    pages.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;

    log.info(`Fetched ${response.results.length} databases`, {
      totalSoFar: pages.length,
      hasMore
    });
  }

  return pages;
}

/**
 * Process a single page
 */
async function processPage(page) {
  const pageId = page.id;
  const title = getPageTitle(page);
  const properties = extractPageProperties(page);

  log.info(`Processing page: ${title}`, { pageId });

  try {
    // Extract full content as markdown
    const markdown = await pageToMarkdown(pageId);

    // Add title as heading
    const fullMarkdown = `# ${title}\n\n${markdown}`;

    // Save to file
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedTitle}_${pageId}.md`;
    const filepath = path.join(EXPORT_DIR, filename);

    await fs.mkdir(EXPORT_DIR, { recursive: true });
    await fs.writeFile(filepath, fullMarkdown, 'utf-8');

    log.info(`Saved markdown file`, { filepath, size: fullMarkdown.length });

    // Prepare BigQuery row
    const row = {
      page_id: pageId,
      title,
      url: page.url,
      object_type: page.object,
      parent_type: page.parent?.type || null,
      parent_id: page.parent?.page_id || page.parent?.database_id || page.parent?.workspace || null,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      created_by: page.created_by?.id || null,
      last_edited_by: page.last_edited_by?.id || null,
      archived: page.archived || false,
      icon_type: page.icon?.type || null,
      icon_emoji: page.icon?.emoji || null,
      cover_url: page.cover?.external?.url || page.cover?.file?.url || null,
      properties: JSON.stringify(properties),
      content_markdown: fullMarkdown,
      content_length: fullMarkdown.length,
      exported_at: new Date().toISOString(),
      raw_json: JSON.stringify(page)
    };

    return row;
  } catch (error) {
    log.error(`Failed to process page: ${title}`, error, { pageId });
    throw error;
  }
}

/**
 * Ensure BigQuery dataset and table exist with correct schema
 */
async function ensureBigQuerySchema() {
  log.info('Ensuring BigQuery dataset and table exist');

  const dataset = bigquery.dataset(BIGQUERY_DATASET);

  // Create dataset if not exists
  try {
    const [exists] = await dataset.exists();
    if (!exists) {
      log.info(`Creating dataset: ${BIGQUERY_DATASET}`);
      await bigquery.createDataset(BIGQUERY_DATASET, {
        location: 'US'
      });
      log.info(`Dataset created: ${BIGQUERY_DATASET}`);
    }
  } catch (error) {
    // Dataset might already exist
    log.warn(`Dataset check/create warning`, { error: error.message });
  }

  // Define table schema
  const schema = [
    { name: 'page_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'title', type: 'STRING', mode: 'REQUIRED' },
    { name: 'url', type: 'STRING', mode: 'NULLABLE' },
    { name: 'object_type', type: 'STRING', mode: 'NULLABLE' },
    { name: 'parent_type', type: 'STRING', mode: 'NULLABLE' },
    { name: 'parent_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'created_time', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'last_edited_time', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'created_by', type: 'STRING', mode: 'NULLABLE' },
    { name: 'last_edited_by', type: 'STRING', mode: 'NULLABLE' },
    { name: 'archived', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'icon_type', type: 'STRING', mode: 'NULLABLE' },
    { name: 'icon_emoji', type: 'STRING', mode: 'NULLABLE' },
    { name: 'cover_url', type: 'STRING', mode: 'NULLABLE' },
    { name: 'properties', type: 'JSON', mode: 'NULLABLE' },
    { name: 'content_markdown', type: 'STRING', mode: 'NULLABLE' },
    { name: 'content_length', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'exported_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'raw_json', type: 'JSON', mode: 'NULLABLE' }
  ];

  const table = dataset.table(BIGQUERY_TABLE);

  try {
    const [exists] = await table.exists();

    if (!exists) {
      log.info(`Creating table: ${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`);
      await dataset.createTable(BIGQUERY_TABLE, { schema });
      log.info(`Table created: ${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`);
    } else {
      log.info(`Table already exists: ${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`);
    }
  } catch (error) {
    log.error('Failed to ensure table exists', error);
    throw error;
  }
}

/**
 * Insert rows into BigQuery with batching
 */
async function insertIntoBigQuery(rows) {
  if (rows.length === 0) {
    log.info('No rows to insert into BigQuery');
    return;
  }

  const table = bigquery.dataset(BIGQUERY_DATASET).table(BIGQUERY_TABLE);

  // BigQuery supports batch inserts, but we'll chunk for safety
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    try {
      await withRetry(
        async () => table.insert(batch, {
          skipInvalidRows: false,
          ignoreUnknownValues: false
        }),
        `Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}`
      );

      inserted += batch.length;
      log.info(`Inserted batch into BigQuery`, {
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batch.length,
        totalInserted: inserted,
        totalRows: rows.length
      });
    } catch (error) {
      log.error(`Failed to insert batch`, error, {
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batch.length
      });

      // If batch insert fails, try row by row
      for (const row of batch) {
        try {
          await table.insert([row]);
          inserted++;
        } catch (rowError) {
          log.error(`Failed to insert row`, rowError, {
            pageId: row.page_id,
            title: row.title
          });
        }
      }
    }
  }

  log.info(`Total rows inserted into BigQuery`, {
    inserted,
    total: rows.length,
    table: `${BIGQUERY_DATASET}.${BIGQUERY_TABLE}`
  });
}

/**
 * Main ingestion function
 */
async function main() {
  const startTime = Date.now();

  log.info('Starting Notion ingestion', {
    exportDir: EXPORT_DIR,
    dataset: BIGQUERY_DATASET,
    table: BIGQUERY_TABLE
  });

  try {
    // Ensure BigQuery schema exists
    await ensureBigQuerySchema();

    // Search all pages
    const pages = await searchAllPages();
    log.info(`Found ${pages.length} total pages and databases`);

    if (pages.length === 0) {
      log.warn('No pages found in Notion workspace');
      return;
    }

    // Process each page
    const rows = [];
    let processed = 0;
    let failed = 0;

    for (const page of pages) {
      try {
        const row = await processPage(page);
        rows.push(row);
        processed++;

        log.info(`Progress: ${processed}/${pages.length}`, {
          pageId: page.id,
          success: true
        });
      } catch (error) {
        failed++;
        log.error(`Failed to process page`, error, {
          pageId: page.id,
          progress: `${processed}/${pages.length}`
        });
      }
    }

    // Insert into BigQuery
    await insertIntoBigQuery(rows);

    const duration = Math.round((Date.now() - startTime) / 1000);

    log.info('Notion ingestion completed', {
      totalPages: pages.length,
      processed,
      failed,
      exported: rows.length,
      durationSeconds: duration
    });

  } catch (error) {
    log.error('Notion ingestion failed', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log.error('Unhandled error in main', error);
  process.exit(1);
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
