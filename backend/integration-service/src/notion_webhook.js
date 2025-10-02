import express from 'express';
import { createLogger } from '../../common/logging/index.js';
import { BigQuery } from '@google-cloud/bigquery';
import crypto from 'crypto';

const logger = createLogger('notion-webhook');
const bigquery = new BigQuery();
const router = express.Router();

// Notion webhook verification secret (set this in Notion dashboard)
const NOTION_WEBHOOK_SECRET = process.env.NOTION_WEBHOOK_SECRET;

/**
 * Notion Webhook Endpoint
 * Receives real-time updates when pages/databases change
 *
 * Events:
 * - page.created
 * - page.updated
 * - database.updated
 */
router.post('/api/notion/webhook', async (req, res) => {
  try {
    // 1. Verify webhook signature (security)
    const signature = req.headers['notion-signature'];
    const timestamp = req.headers['notion-timestamp'];
    const body = JSON.stringify(req.body);

    if (NOTION_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', NOTION_WEBHOOK_SECRET)
        .update(timestamp + body)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid Notion webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // 2. Parse webhook event
    const { event, data } = req.body;
    logger.info({ event, pageId: data?.id }, 'Notion webhook received');

    // 3. Handle different event types
    switch (event) {
      case 'page.created':
        await handlePageCreated(data);
        break;
      case 'page.updated':
        await handlePageUpdated(data);
        break;
      case 'database.updated':
        await handleDatabaseUpdated(data);
        break;
      default:
        logger.warn({ event }, 'Unknown Notion event type');
    }

    // 4. Respond to Notion
    res.json({ success: true, received: event });
  } catch (error) {
    logger.error({ error: error.message }, 'Notion webhook error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle page created event
 * Ingest new page into BigQuery + memory store
 */
async function handlePageCreated(page) {
  const pageData = {
    id: page.id,
    title: extractTitle(page),
    content: await fetchPageContent(page.id),
    url: page.url,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    metadata: JSON.stringify(page),
    ingested_at: new Date().toISOString()
  };

  // Store in BigQuery
  await bigquery
    .dataset('knowledge')
    .table('notion_pages')
    .insert([pageData]);

  logger.info({ pageId: page.id, title: pageData.title }, 'Notion page created and ingested');
}

/**
 * Handle page updated event
 * Update existing page in BigQuery
 */
async function handlePageUpdated(page) {
  const pageData = {
    id: page.id,
    title: extractTitle(page),
    content: await fetchPageContent(page.id),
    last_edited_time: page.last_edited_time,
    metadata: JSON.stringify(page),
    updated_at: new Date().toISOString()
  };

  // Update in BigQuery (delete + insert for simplicity)
  const query = `
    DELETE FROM knowledge.notion_pages WHERE id = @pageId;
    INSERT INTO knowledge.notion_pages (id, title, content, url, created_time, last_edited_time, metadata, ingested_at)
    VALUES (@id, @title, @content, @url, @created_time, @last_edited_time, @metadata, CURRENT_TIMESTAMP())
  `;

  await bigquery.query({
    query,
    params: {
      pageId: page.id,
      id: page.id,
      title: pageData.title,
      content: pageData.content,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      metadata: pageData.metadata
    }
  });

  logger.info({ pageId: page.id, title: pageData.title }, 'Notion page updated');
}

/**
 * Handle database updated event
 * Re-sync entire database
 */
async function handleDatabaseUpdated(database) {
  logger.info({ databaseId: database.id }, 'Notion database updated - triggering full sync');

  // Trigger async full database sync (don't block webhook response)
  setImmediate(() => syncDatabase(database.id));
}

/**
 * Extract page title from Notion page object
 */
function extractTitle(page) {
  try {
    if (page.properties?.title?.title?.[0]?.plain_text) {
      return page.properties.title.title[0].plain_text;
    }
    if (page.properties?.Name?.title?.[0]?.plain_text) {
      return page.properties.Name.title[0].plain_text;
    }
    return 'Untitled';
  } catch {
    return 'Untitled';
  }
}

/**
 * Fetch full page content from Notion API
 */
async function fetchPageContent() {
  // This would use @notionhq/client to fetch blocks
  // For now, return placeholder (implement in notion_ingest.js)
  return 'Content extraction pending';
}

/**
 * Sync entire database (async, triggered by webhook)
 */
async function syncDatabase(databaseId) {
  logger.info({ databaseId }, 'Starting full database sync');
  // Implement full database sync logic here
  // Call notion_ingest.js functions
}

export { router };
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
